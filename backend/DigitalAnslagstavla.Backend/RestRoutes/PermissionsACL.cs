namespace RestRoutes;

using System.Security.Claims;

public static class PermissionsACL
{
    public static async Task<IResult?> CheckPermissions(
        string contentType,
        string httpMethod,
        HttpContext context,
        YesSql.ISession session)
    {
        var requestMethod = (httpMethod ?? "").ToUpperInvariant();

        // ============================
        // ✅ FIX 0: ALLA får läsa (GET)
        // ============================
        if (requestMethod == "GET")
        {
            return null; // Permission granted
        }

        // ============================
        // ✅ FIX 0.5: Inloggade får skapa inlägg (POST) för utvalda content types
        // ============================
        // Löser 403 på POST /api/Post och/eller POST /api/HtmlDashboardWidget för vanliga users.
        // Vi öppnar INTE för Anonymous och INTE för PUT/DELETE.
        if (context.User.Identity?.IsAuthenticated == true && requestMethod == "POST")
        {
            var allowedCreateTypes = new[]
            {
                "Post",
                "HtmlDashboardWidget",
                "Pet"
            };

            if (allowedCreateTypes.Any(t => string.Equals(t, contentType, StringComparison.OrdinalIgnoreCase)))
            {
                return null; // Permission granted
            }
        }

        // ============================
        // ✅ FIX 1: Admin bypass
        // ============================
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var isAdmin = context.User.FindAll(ClaimTypes.Role).Any(r =>
                string.Equals(r.Value, "Administrator", StringComparison.OrdinalIgnoreCase));

            if (isAdmin)
            {
                return null; // Permission granted
            }
        }

        // Fetch all RestPermissions
        var permissions = await GetRoutes.FetchCleanContent("RestPermissions", session, populate: false);

        // Build permissions lookup: permissionsByRole[role][contentType][restMethod] = true
        var permissionsByRole = new Dictionary<string, Dictionary<string, Dictionary<string, bool>>>();

        if (permissions == null) permissions = new List<Dictionary<string, object>>();

        foreach (var permission in permissions)
        {
            if (permission == null) continue;

            static List<string> ConvertCommaSeparatedToList(object? value)
            {
                if (value == null) return new List<string>();

                if (value is Dictionary<string, object> dict && dict.ContainsKey("text"))
                {
                    value = dict["text"];
                }

                if (value is not string strValue) return new List<string>();

                return strValue
                    .Split(',')
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();
            }

            static List<string> ConvertArrayToList(object? value)
            {
                if (value == null) return new List<string>();
                if (value is not IEnumerable<object> enumValue) return new List<string>();

                return enumValue
                    .Select(v => v?.ToString()?.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .Cast<string>()
                    .ToList();
            }

            var roles = ConvertCommaSeparatedToList(permission.GetValueOrDefault("roles"));
            var contentTypes = ConvertCommaSeparatedToList(permission.GetValueOrDefault("contentTypes"));
            var restMethods = ConvertArrayToList(permission.GetValueOrDefault("restMethods"));

            foreach (var role in roles)
            {
                if (!permissionsByRole.ContainsKey(role))
                    permissionsByRole[role] = new Dictionary<string, Dictionary<string, bool>>();

                foreach (var ct in contentTypes)
                {
                    if (!permissionsByRole[role].ContainsKey(ct))
                        permissionsByRole[role][ct] = new Dictionary<string, bool>();

                    foreach (var restMethod in restMethods)
                    {
                        permissionsByRole[role][ct][restMethod] = true;
                    }
                }
            }
        }

        // Get user roles (or "Anonymous" if not authenticated)
        var userRoles = new List<string>();
        if (context.User.Identity?.IsAuthenticated == true)
        {
            userRoles = context.User.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();
        }

        // Always include Anonymous role
        if (!userRoles.Contains("Anonymous"))
        {
            userRoles.Add("Anonymous");
        }

        // Check if any of the user's roles has permission
        var hasPermission = false;
        foreach (var role in userRoles)
        {
            if (permissionsByRole.ContainsKey(role) &&
                permissionsByRole[role].ContainsKey(contentType) &&
                permissionsByRole[role][contentType].ContainsKey(requestMethod))
            {
                hasPermission = true;
                break;
            }
        }

        if (!hasPermission)
        {
            return Results.Json(new
            {
                error = "Forbidden",
                message = $"User does not have permission to {requestMethod} {contentType}"
            }, statusCode: 403);
        }

        return null; // Permission granted
    }
}
