from flask import Flask, request, jsonify
from flask_cors import CORS
from news_api import NewsAPI
from nlp_processor import NLPProcessor
from config import Config
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Updated CORS configuration
CORS(app, origins=[
    'http://localhost:3000',
    'http://172.23.2.8:3000',
    'http://127.0.0.1:3000'
], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])

# Initialize components
news_api = NewsAPI()
nlp_processor = NLPProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI News Chatbot API is running',
        'version': '1.0.0'
    })

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Main chat endpoint - processes user messages and returns news"""
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    # Handle POST request
    if request.method == 'POST':
        try:
            # Log incoming request
            logger.info("=" * 50)
            logger.info("Received chat POST request")
            
            # Get JSON data
            data = request.get_json()
            logger.info(f"Request data: {data}")
            
            if not data:
                logger.error("No JSON data received")
                return jsonify({
                    'success': False,
                    'error': 'No data provided'
                }), 400
            
            user_message = data.get('message', '').strip()
            logger.info(f"User message: '{user_message}'")
            
            if not user_message:
                logger.error("Empty message received")
                return jsonify({
                    'success': False,
                    'error': 'Message cannot be empty'
                }), 400
            
            # Process message with NLP
            logger.info("Processing with NLP...")
            query_info = nlp_processor.extract_query_info(user_message)
            logger.info(f"Query info: {query_info}")
            
            # Validate keywords
            if query_info.get('keywords') and len(query_info['keywords']) < 2:
                query_info['keywords'] = None
            
            # Fetch news
            logger.info("Fetching news...")
            news_articles = fetch_news(query_info)
            logger.info(f"Fetched {len(news_articles)} articles")
            
            # Generate response
            response_text = generate_response(news_articles, query_info)
            suggestions = generate_suggestions(query_info)
            
            # Prepare response
            response_data = {
                'success': True,
                'response': response_text,
                'articles': news_articles,
                'query_info': query_info,
                'suggestions': suggestions,
                'total_articles': len(news_articles)
            }
            
            logger.info(f"Sending response with {len(news_articles)} articles")
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"Error in chat endpoint: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    # If method is not allowed
    return jsonify({'error': 'Method not allowed'}), 405

@app.route('/api/categories', methods=['GET', 'OPTIONS'])
def get_categories():
    """Get all available news categories"""
    
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        categories = []
        for category_id, category_info in Config.CATEGORIES.items():
            categories.append({
                'id': category_id,
                'name': category_info['name'],
                'description': category_info['description'],
                'keywords': category_info['keywords'][:5]
            })
        
        return jsonify({
            'success': True,
            'categories': categories
        })
    except Exception as e:
        logger.error(f"Error in categories endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch categories'
        }), 500

@app.route('/api/countries', methods=['GET', 'OPTIONS'])
def get_countries():
    """Get all available countries"""
    
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        countries = []
        for country_code, country_info in Config.COUNTRIES.items():
            countries.append({
                'code': country_code,
                'name': country_info['name'],
                'keywords': country_info['keywords']
            })
        
        return jsonify({
            'success': True,
            'countries': countries
        })
    except Exception as e:
        logger.error(f"Error in countries endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch countries'
        }), 500

@app.route('/api/search', methods=['GET', 'OPTIONS'])
def search():
    """Direct search endpoint"""
    
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        query = request.args.get('q', '')
        category = request.args.get('category', None)
        
        if not query or len(query) < 2:
            return jsonify({
                'success': False,
                'error': 'Search query must be at least 2 characters long'
            }), 400
        
        logger.info(f"Direct search for: {query}, category: {category}")
        
        articles = news_api.search_news(query, category)
        
        return jsonify({
            'success': True,
            'articles': articles,
            'query': query,
            'total': len(articles)
        })
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

def fetch_news(query_info):
    """Intelligent news fetching based on query analysis"""
    try:
        category = query_info.get('category', 'general')
        country = query_info.get('country')
        keywords = query_info.get('keywords')
        
        logger.info(f"Fetching news - Category: {category}, Country: {country}, Keywords: {keywords}")
        
        # Priority 1: Keyword-based search
        if keywords and len(keywords) > 2:
            logger.info(f"Performing keyword search for: {keywords}")
            articles = news_api.search_news(keywords, category)
            if articles:
                return articles
        
        # Priority 2: Category + Country combination
        if country and category and category != 'general':
            logger.info(f"Fetching {category} news from {country}")
            articles = news_api.get_top_headlines(category=category, country=country)
            if articles:
                return articles
        
        # Priority 3: Category only
        if category and category != 'general':
            logger.info(f"Fetching {category} news")
            articles = news_api.get_category_news(category)
            if articles:
                return articles
        
        # Priority 4: Country only
        if country:
            logger.info(f"Fetching news from {country}")
            articles = news_api.get_country_news(country)
            if articles:
                return articles
        
        # Priority 5: General news
        logger.info("Fetching general news as fallback")
        return news_api.get_top_headlines()
        
    except Exception as e:
        logger.error(f"Error in fetch_news: {e}")
        return []

def generate_response(articles, query_info):
    """Generate contextual responses based on query and results"""
    try:
        if not articles:
            return "No news articles found. Try a different query!"
        
        category = query_info.get('category', 'general')
        country_code = query_info.get('country')
        keywords = query_info.get('keywords')
        
        # Get category name
        category_name = Config.CATEGORIES.get(category, {}).get('name', 'General')
        
        # Get country name if available
        country_name = None
        if country_code and country_code in Config.COUNTRIES:
            country_name = Config.COUNTRIES[country_code]['name']
        
        # Generate appropriate response
        if keywords and len(keywords) > 2:
            if len(articles) == 1:
                return f"I found 1 article about '{keywords}':"
            else:
                return f"I found {len(articles)} articles about '{keywords}':"
        
        elif country_name and category_name != 'General':
            return f"Here are the latest {category_name} headlines from {country_name}:"
        
        elif category_name != 'General':
            return f"Here are the latest {category_name} news articles:"
        
        elif country_name:
            return f"Here are the top headlines from {country_name}:"
        
        else:
            return "Here are the latest news headlines from around the world:"
            
    except Exception as e:
        logger.error(f"Error in generate_response: {e}")
        return "Here are the latest news headlines:"

def generate_suggestions(query_info):
    """Generate relevant follow-up suggestions"""
    suggestions = [
        "Technology news",
        "Sports news",
        "Business headlines",
        "News about AI",
        "India news",
        "Health news",
        "Science news",
        "Entertainment news"
    ]
    return suggestions[:5]

if __name__ == '__main__':
    port = Config.PORT
    logger.info(f"Starting AI News Chatbot API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)