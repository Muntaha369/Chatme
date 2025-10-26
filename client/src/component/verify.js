export const verifyToken = async () => {
    const token = localStorage.getItem('authToken');

    if (token) { 
        try {
            const response = await fetch('http://localhost:3002/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({ token: token }),
            });

            if (response.ok) {
                const data = await response.json(); 
                console.log("Verification successful:", data);
                return data; 
            } else {
                const errorData = await response.json();
                console.error("Verification failed:", response.status, errorData);
                return errorData; 
            }
        } catch (error) {
            console.error("Network error during verification:", error);
            return { success: false, message: 'Network error during verification.' };
        }
    } else {

        console.log("No token found in localStorage.");
        return { success: false, message: "No token found" }; 
    }
};