using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClientApp.Controllers
{
    public class ProviderController : Controller
    {
        //[Authorize]
        public ActionResult Index()
        {
            // a call to the LetSkillsBackend 
            //var dbusers = await ApiCallToUsers();
            //ViewData["dbusers"] = dbusers.IsSuccessStatusCode ? await dbusers.Content.ReadAsStringAsync() : dbusers.StatusCode.ToString();
            
            return View();
        }
        

        private async Task<HttpResponseMessage> ApiCallToUsers()
        {
            var accessToken = await HttpContext.Authentication.GetTokenAsync("access_token");

            var client = new HttpClient();
            client.SetBearerToken(accessToken);

            return await client.GetAsync("http://localhost:5004/api/users");
        }

        public async Task Logout()
        {
            await HttpContext.Authentication.SignOutAsync("Cookies");
            await HttpContext.Authentication.SignOutAsync("oidc");
        }
    }
}
