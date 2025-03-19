const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || `http://${window.location.hostname}:5000`;

const config = {
    apiBaseUrl,
    anotherConfig: 'value'
};

export default config;
