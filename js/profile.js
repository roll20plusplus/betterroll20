var userAttributes = getUserProfile();
console.log(userAttributes);

const UserProfileAttributes = {
    Gender: "gender",
    UserName: "preferred_username",
    Email: "email",
    EmailVerified: "email_verified",
    FullName: "name"
}

function initUserAttributes() {
    console.log("Getting and assigning user attribute values")
    getUserProfile(function(result) {
        console.log(result);
        if (result == null) {
            console.log('Couldnt get user attributes');
            return;
        }
        for (i = 0; i < result.length; i++) {
            switch(result[i].getName()) {
                case UserProfileAttributes.Email:
                    document.getElementById("email").value = result[i].getValue();
                    break;
                case UserProfileAttributes.FullName:
                    document.getElementById("name").value = result[i].getValue();
                    break;
                case UserProfileAttributes.UserName:
                    document.getElementById("username").value = result[i].getValue();
                    break;
                case UserProfileAttributes.Gender:
                    document.getElementById("gender").value = result[i].getValue();
                    break;
                case UserProfileAttributes.EmailVerified:
                    if (result[i].getValue() == true) {
                        document.getElementById("emailverified").style.display = "none";
                    }
//                    userEmailVerified = result[i].getValue();
                    break;
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', event => {
    initUserAttributes();
});