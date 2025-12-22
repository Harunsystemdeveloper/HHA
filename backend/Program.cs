using Microsoft.AspNetCore.Http;
using OrchardCore.Logging;
using RestRoutes;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

// Cookie-dev settings
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

builder.Services.AddOrchardCms();

// CORS för Vite
builder.Services.AddCors(options =>
{
    options.AddPolicy("React", policy =>
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("React");

// ✅ 1) Mappar dina REST-routes FÖRE Orchard
app.MapRestRoutes();

// ✅ 2) Orchard sist
app.UseOrchardCore();

app.Run();
