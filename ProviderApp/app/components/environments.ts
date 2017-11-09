

// Dev environment
export class EnvironmentConfig {
    public static stsServer = 'http://localhost:5000';
    public static redirect_url = 'http://localhost:5005/provider';
    public static post_logout_redirect_uri = 'http://localhost:5005/';

    public static let_skills_backend_url = 'http://localhost:5004/api/';
}

// Prod environment
//export class EnvironmentConfig {
//  public static stsServer = 'http://localhost:5000';
//  public static redirect_url = 'http://localhost/provider';
//  public static post_logout_redirect_uri = 'http://localhost/';

//  public static let_skills_backend_url = 'http://localhost:5004/api/';
//}