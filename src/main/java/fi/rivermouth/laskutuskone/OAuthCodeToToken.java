package fi.rivermouth.laskutuskone;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class OAuthCodeToToken extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private final String USER_AGENT = "Mozilla/5.0";
	
	public static final String DEFAULT_OAUTH_PROPERTIES_FILE_NAME = "/WEB-INF/oauth.properties";
	public static final String REDIRECT_URI = "http://laskutuskone.appspot.com";

	/** The OAuth 2.0 Client ID */
	private String clientId;

	/** The OAuth 2.0 Client Secret */
	private String clientSecret;

	/** The Google APIs scopes to access */
	private String scopes;
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		/*
		code=4/v6xr77ewYqhvHSyW6UJ1w7jKwAzu&
		client_id=8819981768.apps.googleusercontent.com&
		client_secret=your_client_secret&
		redirect_uri=https://oauth2-login-demo.appspot.com/code&
		grant_type=authorization_code
		 */
		
		String[] code = req.getParameterValues("code");
		//String queryString = "?" + req.getQueryString();
		String response = "null";
		
		// If url param "code" is given, exchange it to access_token
		if (code != null && code.length > 0) {
			getOAuthProperties();
			
			response = sendPost("https://accounts.google.com/o/oauth2/token", 
					"code=" + code[0] + "&" +
					"client_id=" + getClientId() + "&" +
					"client_secret=" + getClientSecret() + "&" + 
					"redirect_uri=" + REDIRECT_URI + "&" + 
					"grant_type=authorization_code");

			// Rename url param "code" to "user_code"
			//queryString = queryString.replaceAll("&code=", "&used_code=").replaceAll("\\?code=", "?used_code=");
		}

		PrintWriter out = resp.getWriter();
		resp.setContentType("application/json"); 
		out.print(response);
		out.flush();
		
		//resp.sendRedirect("/" + queryString);
	}
	
	private String sendPost(String url, String params) throws IOException {
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
 
		//add reuqest header
		con.setRequestMethod("POST");
		con.setRequestProperty("User-Agent", USER_AGENT);
		con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
 
		// Send post request
		con.setDoOutput(true);
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.writeBytes(params);
		wr.flush();
		wr.close();
 
		int responseCode = con.getResponseCode();
		System.out.println("\nSending 'POST' request to URL : " + url);
		System.out.println("Post parameters : " + params);
		System.out.println("Response Code : " + responseCode);
 
		BufferedReader in = new BufferedReader(
		        new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();
 
		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();
 
		return response.toString();
	}
	
	/**
	 * Instantiates a new OauthProperties object reading its values from the
	 * given properties file.
	 * 
	 * @param propertiesFile
	 *            the InputStream to read an OAuth Properties file. The file
	 *            should contain the keys {@code clientId}, {@code clientSecret}
	 *            and {@code scopes}
	 * @throws IOException
	 *             IF there is an issue reading the {@code propertiesFile}
	 * @throws OAuthPropertiesFormatException
	 *             If the given {@code propertiesFile} is not of the right
	 *             format (does not contains the keys {@code clientId},
	 *             {@code clientSecret} and {@code scopes})
	 */
	public void getOAuthProperties() throws IOException {
		Properties oauthProperties = new Properties();
		oauthProperties.load(getServletContext().getResourceAsStream(DEFAULT_OAUTH_PROPERTIES_FILE_NAME));
		clientId = oauthProperties.getProperty("clientId");
		clientSecret = oauthProperties.getProperty("clientSecret");
		scopes = oauthProperties.getProperty("scopes");
		if ((clientId == null) || (clientSecret == null) || (scopes == null)) {
			throw new OAuthPropertiesFormatException();
		}
	}

	/**
	 * @return the clientId
	 */
	public String getClientId() {
		return clientId;
	}

	/**
	 * @return the clientSecret
	 */
	public String getClientSecret() {
		return clientSecret;
	}

	/**
	 * @return the scopes
	 */
	public String getScopesAsString() {
		return scopes;
	}
	
	/**
	 * Thrown when the OAuth properties file was not at the right format, i.e
	 * not having the right properties names.
	 */
	@SuppressWarnings("serial")
	public class OAuthPropertiesFormatException extends RuntimeException {
	}
	

}
