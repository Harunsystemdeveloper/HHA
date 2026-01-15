namespace RestRoutes;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using OrchardCore.Users;
using OrchardCore.Users.Models;
using OrchardCore.Users.Services;
using System.Text.Json.Nodes;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // POST /api/auth/register
        app.MapPost("/api/auth/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IUserService userService,
            [FromServices] UserManager<IUser> userManager
        ) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Username and password required" });
            }

            var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone;
            var errors = new Dictionary<string, string>();

            var user = await userService.CreateUserAsync(
                new User
                {
                    UserName = request.Username,
                    Email = request.Email,
                    EmailConfirmed = true,
                    PhoneNumber = phone,
                    Properties = new JsonObject
                    {
                        ["FirstName"] = request.FirstName ?? "",
                        ["LastName"] = request.LastName ?? ""
                    }
                },
                request.Password,
                (key, message) => errors[key] = message
            );

            if (user == null)
            {
                return Results.BadRequest(new
                {
                    error = "Registration failed",
                    details = errors
                });
            }

            const string desiredRole = "Customer";
            bool roleAssigned = false;
            List<string> roleErrors = new();

            try
            {
                var roleResult = await userManager.AddToRoleAsync(user, desiredRole);
                if (!roleResult.Succeeded)
                {
                    roleErrors.AddRange(roleResult.Errors.Select(e => e.Description));
                }
                else
                {
                    roleAssigned = true;
                }
            }
            catch (Exception ex)
            {
                roleErrors.Add($"Role assignment exception: {ex.Message}");
            }

            return Results.Ok(new
            {
                username = user.UserName,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                phone = phone,
                role = desiredRole,
                roleAssigned = roleAssigned,
                roleErrors = roleErrors,
                message = roleAssigned
                    ? "User created successfully (role assigned)"
                    : "User created successfully (role not assigned)"
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // POST /api/auth/login
        app.MapPost("/api/auth/login", async (
            HttpContext context,
            [FromServices] SignInManager<IUser> signInManager,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var request = await context.Request.ReadFromJsonAsync<LoginRequest>();

            if (request == null ||
                string.IsNullOrWhiteSpace(request.UsernameOrEmail) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Cannot read request body" });
            }

            var user = await userManager.FindByNameAsync(request.UsernameOrEmail)
                       ?? await userManager.FindByEmailAsync(request.UsernameOrEmail);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: false
            );

            if (!result.Succeeded)
            {
                return Results.Unauthorized();
            }

            var roles = await userManager.GetRolesAsync(user);
            var u = user as User;

            return Results.Ok(new
            {
                isAuthenticated = true,
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // ✅ FIX: GET /api/auth/login ska INTE ge 401 när man är utloggad
        app.MapGet("/api/auth/login", async (
            HttpContext context,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(context.User);

            if (user == null)
            {
                return Results.Ok(new
                {
                    isAuthenticated = false,
                    username = (string?)null,
                    roles = new[] { "Anonymous" }
                });
            }

            var roles = await userManager.GetRolesAsync(user);
            var u = user as User;

            return Results.Ok(new
            {
                isAuthenticated = true,
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        })
        .AllowAnonymous();

        // DELETE /api/auth/login
        app.MapDelete("/api/auth/login", async (
            [FromServices] SignInManager<IUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logged out successfully" });
        })
        .AllowAnonymous()
        .DisableAntiforgery();
    }

    // ✅ Overload: endpoints.MapAuthEndpoints()
    public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/auth/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IUserService userService,
            [FromServices] UserManager<IUser> userManager
        ) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Username and password required" });
            }

            var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone;
            var errors = new Dictionary<string, string>();

            var user = await userService.CreateUserAsync(
                new User
                {
                    UserName = request.Username,
                    Email = request.Email,
                    EmailConfirmed = true,
                    PhoneNumber = phone,
                    Properties = new JsonObject
                    {
                        ["FirstName"] = request.FirstName ?? "",
                        ["LastName"] = request.LastName ?? ""
                    }
                },
                request.Password,
                (key, message) => errors[key] = message
            );

            if (user == null)
            {
                return Results.BadRequest(new { error = "Registration failed", details = errors });
            }

            const string desiredRole = "Customer";
            bool roleAssigned = false;
            List<string> roleErrors = new();

            try
            {
                var roleResult = await userManager.AddToRoleAsync(user, desiredRole);
                if (!roleResult.Succeeded)
                    roleErrors.AddRange(roleResult.Errors.Select(e => e.Description));
                else
                    roleAssigned = true;
            }
            catch (Exception ex)
            {
                roleErrors.Add($"Role assignment exception: {ex.Message}");
            }

            return Results.Ok(new
            {
                username = user.UserName,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                phone = phone,
                role = desiredRole,
                roleAssigned = roleAssigned,
                roleErrors = roleErrors,
                message = roleAssigned
                    ? "User created successfully (role assigned)"
                    : "User created successfully (role not assigned)"
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        endpoints.MapPost("/api/auth/login", async (
            HttpContext context,
            [FromServices] SignInManager<IUser> signInManager,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var request = await context.Request.ReadFromJsonAsync<LoginRequest>();

            if (request == null ||
                string.IsNullOrWhiteSpace(request.UsernameOrEmail) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Cannot read request body" });
            }

            var user = await userManager.FindByNameAsync(request.UsernameOrEmail)
                       ?? await userManager.FindByEmailAsync(request.UsernameOrEmail);

            if (user == null) return Results.Unauthorized();

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: false
            );

            if (!result.Succeeded) return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);
            var u = user as User;

            return Results.Ok(new
            {
                isAuthenticated = true,
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // ✅ FIX: även här – returnera 200 istället för 401 när utloggad
        endpoints.MapGet("/api/auth/login", async (
            HttpContext context,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(context.User);

            if (user == null)
            {
                return Results.Ok(new
                {
                    isAuthenticated = false,
                    username = (string?)null,
                    roles = new[] { "Anonymous" }
                });
            }

            var roles = await userManager.GetRolesAsync(user);
            var u = user as User;

            return Results.Ok(new
            {
                isAuthenticated = true,
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        })
        .AllowAnonymous();

        endpoints.MapDelete("/api/auth/login", async (
            [FromServices] SignInManager<IUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logged out successfully" });
        })
        .AllowAnonymous()
        .DisableAntiforgery();
    }
}

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    string? Phone
);

public record LoginRequest(string UsernameOrEmail, string Password);
