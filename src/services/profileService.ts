import env from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
export async function uploadImage(id: string, imageFormData: FormData): Promise<any> {
    try {
        const response = await fetch(`${env.BASE_URL}UserProfile/UpdateProfileImage/${id}`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
            body: imageFormData,
        });
        const text = await response.text();
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
        console.error('uploadImage error:', error);
        return { error: (error as Error)?.message || 'Network error' };
    }
}

async function getToken(): Promise<string> {
    try {
        const authToken = await AsyncStorage.getItem('AuthToken');
        console.log("User details from AsyncStorage:", authToken);

        const parsed = authToken ? JSON.parse(authToken) : null;
        console.log("Parsed userDetails:", parsed);

        return parsed?.authToken || '';
    } catch (error) {
        console.error('Error reading auth token:', error);
        return '';
    }
}
async function getHeaders(): Promise<Record<string, string>> {
    const token = await getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0', // Optional, can be removed
    };
}

export async function getAllConnectionsCount(userId: string): Promise<any> {
    try {
        console.log("userid", userId);

        const headers = await getHeaders();
        const response = await fetch(`${env.BASE_URL}UserProfile/GetCountsAsync/${userId}`, {
            method: 'GET',
            headers: headers,
        });

        const text = await response.text();
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
        console.error('getAllConnectionsCount error:', error);
        return { error: (error as Error)?.message || 'Network error' };
    }
}
