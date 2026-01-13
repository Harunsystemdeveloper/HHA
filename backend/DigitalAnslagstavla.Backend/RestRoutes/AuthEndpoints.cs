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
    // ✅ Din befintliga metod (oförändrad)
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // POST /api/auth/register - Register new user
        app.MapPost("/api/auth/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IUserService userService,
            [FromServices] UserManager<IUser> userManager) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Username and password required" });
            }

            // Orchard (Admin UI) kräver ofta E.164-format för telefon: +467...
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

            // Assign role (Customer måste finnas i Orchard -> Security -> Roles)
            var roleResult = await userManager.AddToRoleAsync(user, "Customer");
            if (!roleResult.Succeeded)
            {
                return Results.BadRequest(new
                {
                    error = "User created but role assignment failed",
                    details = roleResult.Errors.Select(e => e.Description).ToList()
                });
            }

            return Results.Ok(new
            {
                username = user.UserName,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                phone = phone,
                role = "Customer",
                message = "User created successfully"
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // ✅ FIX: Läs request body manuellt (undviker binding-problem)
        // POST /api/auth/login - Login with username OR email
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

        // GET /api/auth/login - Get current user
        app.MapGet("/api/auth/login", async (
            HttpContext context,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(context.User);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var roles = await userManager.GetRolesAsync(user);

            var u = user as User;
            return Results.Ok(new
            {
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        });

        // DELETE /api/auth/login - Logout
        app.MapDelete("/api/auth/login", async (
            [FromServices] SignInManager<IUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logged out successfully" });
        })
        .AllowAnonymous()
        .DisableAntiforgery();
    }

    // ✅ NY overload: samma routes men kan mappas via endpoints.MapAuthEndpoints()
    public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/auth/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IUserService userService,
            [FromServices] UserManager<IUser> userManager) =>
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

            var roleResult = await userManager.AddToRoleAsync(user, "Customer");
            if (!roleResult.Succeeded)
            {
                return Results.BadRequest(new
                {
                    error = "User created but role assignment failed",
                    details = roleResult.Errors.Select(e => e.Description).ToList()
                });
            }

            return Results.Ok(new
            {
                username = user.UserName,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                phone = phone,
                role = "Customer",
                message = "User created successfully"
            });
        })
        .AllowAnonymous()
        .DisableAntiforgery();

        // ✅ FIX: Läs request body manuellt (undviker binding-problem)
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

        endpoints.MapGet("/api/auth/login", async (
            HttpContext context,
            [FromServices] UserManager<IUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(context.User);
            if (user == null) return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);
            var u = user as User;

            return Results.Ok(new
            {
                username = user.UserName,
                email = u?.Email,
                phoneNumber = u?.PhoneNumber,
                firstName = u?.Properties?["FirstName"]?.ToString(),
                lastName = u?.Properties?["LastName"]?.ToString(),
                roles = roles.ToList()
            });
        });

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
