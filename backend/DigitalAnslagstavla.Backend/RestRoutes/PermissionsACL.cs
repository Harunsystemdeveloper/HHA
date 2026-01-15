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

        // ✅ ALLA får läsa (fixar "försvinner när jag loggar ut")
        if (requestMethod == "GET")
            return null;

        // ✅ Admin bypass
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var isAdmin = context.User.FindAll(ClaimTypes.Role).Any(r =>
                string.Equals(r.Value, "Administrator", StringComparison.OrdinalIgnoreCase));

            if (isAdmin) return null;
        }

        // Fetch all RestPermissions
        var permissions = await GetRoutes.FetchCleanContent("RestPermissions", session, populate: false);

        var permissionsByRole = new Dictionary<string, Dictionary<string, Dictionary<string, bool>>>();
        if (permissions == null) permissions = new List<Dictionary<string, object>>();

        foreach (var permission in permissions)
        {
            if (permission == null) continue;

            static List<string> ConvertCommaSeparatedToList(object? value)
            {
                if (value == null) return new();

                if (value is Dictionary<string, object> dict && dict.ContainsKey("text"))
                    value = dict["text"];

                if (value is not string strValue) return new();

                return strValue.Split(',')
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();
            }

            static List<string> ConvertArrayToList(object? value)
            {
                if (value == null) return new();
                if (value is not IEnumerable<object> enumValue) return new();

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
                        permissionsByRole[role][ct][restMethod] = true;
                }
            }
        }

        var userRoles = new List<string>();
        if (context.User.Identity?.IsAuthenticated == true)
        {
            userRoles = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        }

        if (!userRoles.Contains("Anonymous"))
            userRoles.Add("Anonymous");

        var hasPermission = userRoles.Any(role =>
            permissionsByRole.ContainsKey(role) &&
            permissionsByRole[role].ContainsKey(contentType) &&
            permissionsByRole[role][contentType].ContainsKey(requestMethod));

        if (!hasPermission)
        {
            return Results.Json(new
            {
                error = "Forbidden",
                message = $"User does not have permission to {requestMethod} {contentType}"
            }, statusCode: 403);
        }

        return null;
    }
}
