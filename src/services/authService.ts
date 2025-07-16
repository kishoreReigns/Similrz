import env from '../config/env';

export async function loginService(data: { userName: string; password: string; rememberMe?: boolean }) {
    try {
        // Log the payload for debugging
        console.log('LoginService payload:', data);
        const sanitizedData = {
            userName: (data.userName || '').trim(),
            password: (data.password || '').trim(),
            rememberMe: data.rememberMe !== undefined ? data.rememberMe : true,
        };
        console.log('LoginService sanitized payload:', sanitizedData);
        const response = await fetch(`${env.BASE_URL}LoginRegister/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0', // mimic browser
            },
            body: JSON.stringify(sanitizedData),
        });
        // Log the status code for debugging
        console.log('LoginService status:', response.status);
        // Log the raw response for debugging
        const text = await response.text();
        console.log('Raw API response:', text);
        let resData;
        try {
            resData = JSON.parse(text);
        } catch {
            resData = text;
        }
        if (!response.ok) {
            let errorMsg = 'Network error';
            if (resData && typeof resData === 'object') {
                errorMsg = resData?.message || JSON.stringify(resData);
            }
            throw new Error(errorMsg);
        }
        return resData;
    } catch (error) {
        console.error('LoginService error:', error);
        return { error: (error as Error)?.message || 'Network error' };
    }
}

export async function getUserProfilePic(userId: string): Promise<any> {
    try {
        const url = `${env.BASE_URL}UserProfile/GetUserProfilePic/${userId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            },
        });
        const text = await response.text();
        let resData;
        try {
            resData = JSON.parse(text);
            console.log("resData:", resData);

        } catch {
            resData = text;
        }
        if (!response.ok) {
            let errorMsg = 'Network error';
            if (resData && typeof resData === 'object') {
                errorMsg = resData?.message || JSON.stringify(resData);
            }
            throw new Error(errorMsg);
        }
        return resData;
    } catch (error) {
        console.error('getUserProfilePic error:', error);
        return { error: (error as Error)?.message || 'Network error' };
    }
}

export async function registerUser(data: any): Promise<any> {
    try {
        // Log the payload for debugging
        console.log('registerUser payload:', data);
        const response = await fetch(`${env.BASE_URL}LoginRegister/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0', // mimic browser
            },
            body: JSON.stringify(data),
        });
        // Log the status code for debugging
        console.log('registerUser status:', response.status);
        // Log the raw response for debugging
        const text = await response.text();
        console.log('Raw API response:', text);
        let resData;
        try {
            resData = JSON.parse(text);
        } catch {
            resData = text;
        }
        if (!response.ok) {
            let errorMsg = 'Network error';
            if (resData && typeof resData === 'object') {
                errorMsg = resData?.message || JSON.stringify(resData);
            }
            throw new Error(errorMsg);
        }
        return resData;
    } catch (error) {
        console.error('registerUser error:', error);
        return { error: (error as Error)?.message || 'Network error' };
    }
}

export async function convertImageToBlob(imageUri: string, fileName?: string, mimeType?: string): Promise<{ formData: FormData; blob: Blob; fileName: string }> {
    try {
        // Fetch the image as a blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        // Default file name if not provided
        const name = fileName || `${Date.now()}.jpeg`;
        // Default mime type if not provided
        const type = mimeType || blob.type || 'image/jpeg';
        // Create FormData
        const formData = new FormData();
        formData.append('image', blob, name);
        return { formData, blob, fileName: name };
    } catch (err) {
        console.error('convertImageToBlob error:', err);
        throw err;
    }
}
