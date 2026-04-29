export function isLoggedIn() {
    return !!(
        localStorage.getItem("user_token") ||
        sessionStorage.getItem("user_token")
    );
}

export function isPremiumUser() {
    return localStorage.getItem("isPremium") === "true";
}