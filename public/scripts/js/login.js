$(document).ready(function () {
    sessionStorage.ktt = 0
    $("#btnregister").click(function () { 
        window.location.href = "/register";
        
    });
    $("#btnlogin").click(function () { 
        window.location.href = "/auth/google";
        
    });
    
})