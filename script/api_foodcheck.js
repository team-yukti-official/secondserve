window.API_CONFIG = window.API_CONFIG || {
  BASE_URL: window.ENV_CONFIG?.API_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
  API_KEY: window.ENV_CONFIG?.API_KEY || '',
  AI_MODEL_NAME: window.ENV_CONFIG?.AI_MODEL_NAME || 'nvidia/nemotron-nano-12b-v2-vl:free',
  USE_LOCAL_FOOD_CHECK: window.ENV_CONFIG?.USE_LOCAL_FOOD_CHECK === true
};
