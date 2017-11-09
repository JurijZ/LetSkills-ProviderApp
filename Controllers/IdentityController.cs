using System;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using System.Security.Claims;
using System.Linq;

namespace ClientApp.Controllers
{
    public class IdentityController : Controller
    {
        [Authorize]
        public async Task<IActionResult> Index()
        {
            // a call to the ApiApp 
            var apiCallUsingUserAccessToken = await ApiCallUsingUserAccessToken();
            ViewData["apiCallUsingUserAccessToken"] = apiCallUsingUserAccessToken.IsSuccessStatusCode ? await apiCallUsingUserAccessToken.Content.ReadAsStringAsync() : apiCallUsingUserAccessToken.StatusCode.ToString();

            // a call to the ApiApp 
            var clientCredentialsResponse = await ApiCallUsingClientCredentials();
            ViewData["clientCredentialsResponse"] = clientCredentialsResponse.IsSuccessStatusCode ? await clientCredentialsResponse.Content.ReadAsStringAsync() : clientCredentialsResponse.StatusCode.ToString();

            // a call to the LetSkillsBackend 
            var dbusers = await ApiCallToUsers();
            ViewData["dbusers"] = dbusers.IsSuccessStatusCode ? await dbusers.Content.ReadAsStringAsync() : dbusers.StatusCode.ToString();

            // User session claims
            var userJWTClaims = CurrentUserJWTClaims();
            ViewData["currentuserclaims"] = userJWTClaims;

            // Logged in user email
            var userEmail = CurrentUserEmail();
            ViewData["userEmail"] = userEmail;


            return View();
        }

        private async Task<HttpResponseMessage> ApiCallUsingUserAccessToken()
        {
            var accessToken = await HttpContext.Authentication.GetTokenAsync("access_token");

            var client = new HttpClient();
            client.SetBearerToken(accessToken);

            return await client.GetAsync("http://localhost:5001/api/identity");
        }

        private async Task<HttpResponseMessage> ApiCallUsingClientCredentials()
        {
            var tokenClient = new TokenClient("http://localhost:5000/connect/token", "mvc", "secret");
            var tokenResponse = await tokenClient.RequestClientCredentialsAsync("apiApp");

            var client = new HttpClient();
            client.SetBearerToken(tokenResponse.AccessToken);

            return await client.GetAsync("http://localhost:5001/api/identity");
        }

        private async Task<HttpResponseMessage> ApiCallToUsers()
        {
            var accessToken = await HttpContext.Authentication.GetTokenAsync("access_token");

            var client = new HttpClient();
            client.SetBearerToken(accessToken);

            return await client.GetAsync("http://localhost:5004/api/users");
        }

        private string CurrentUserJWTClaims()
        {
            string allClaims = "";

            foreach (var claim in User.Claims)
            {
                allClaims = allClaims + claim.Type + " - " + claim.Value + "; ";
            }

            return allClaims;
        }


        private string CurrentUserEmail()
        {
            // Extract an email from the users JWT claim
            var userEmail = User.Claims.Where(x => x.Type == "name").FirstOrDefault();
            
            return userEmail.Value;
        }

        public async Task Logout()
        {
            await HttpContext.Authentication.SignOutAsync("Cookies");
            await HttpContext.Authentication.SignOutAsync("oidc");
        }
    }
}
