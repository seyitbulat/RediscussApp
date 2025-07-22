using Microsoft.AspNetCore.Mvc;
using Rediscuss.Shared.Contracts;

namespace Rediscuss.ForumService.Controllers
{
    public class CustomBaseController : ControllerBase
    {
        [NonAction]
        public IActionResult CreateActionResult<T>(ApiResponse<T> response)
        {
            if(response.StatusCode == 204)
            {
                return new ObjectResult(null) { StatusCode = response.StatusCode};
            }

            return new ObjectResult(response) { StatusCode = response.StatusCode };

        }
    }
}
