import axios from 'axios';

export async function getAllPost(userId: string, pageNumber: number, isGroupOnly: number) {
    const BASE_URL = 'https://trustindexscore.com:448/api/';
    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    const url = `${BASE_URL}Post/GetActivePostsAsync/${userId}/${pageNumber}/${isGroupOnly}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    try {
        const response = await axios.get(url, { headers });
        console.log("getAllPost axios response status:", response.status);
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            console.log('getAllPost error:', err.response.status, err.response.data);
        } else {
            console.log('getAllPost error:', String(err));
        }
        return [];
    }
}

export async function getPostLikes(postId: string) {
    const BASE_URL = 'https://trustindexscore.com:448/api/';
    console.log("postId:", postId);

    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    const url = `${BASE_URL}Post/GetPostLikesAsync/${postId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.log('getPostLikes error:', err);
        return [];
    }
}

export async function likeOrUnlikePost(postId: string, userId: string) {
    console.log("likeOrUnlikePost called with postId:", postId, "and userId:", userId);

    const BASE_URL = 'https://trustindexscore.com:448/api/';
    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    const url = `${BASE_URL}Post/LikeUnlikePostAsync`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    const body = JSON.stringify({
        id: 0,
        postId: postId,
        userId: userId,
        isLiked: true,
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.log('likeOrUnlikePost error:', err);
        return null;
    }
}

export async function likeOrDisLikePost(data: { id: number; postId: string; userId: string; isLiked: boolean }) {
    const BASE_URL = 'https://trustindexscore.com:448/api/';
    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    const url = `${BASE_URL}Post/LikeOrDisLikePostAsync`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.log('likeOrDisLikePost error:', err);
        return null;
    }
}

export async function getPostCommentsAsync(postId: number) {
    const BASE_URL = 'https://trustindexscore.com:448/api/';
    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
        if (!token) {
            const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('AuthToken') : '';
            token = localToken || '';
        }
        console.log("getPostCommentsAsync token:", token, "postId:", postId);
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    if (!token) {
        console.log('No AuthToken found. Cannot fetch comments.');
        return [];
    }
    const url = `${BASE_URL}Post/GetPostCommentsAsync/${postId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    try {
        const response = await axios.get(url, { headers });
        console.log("getPostCommentsAsync axios response status:", response.status);
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            console.log('getPostCommentsAsync error:', err.response.status, err.response.data);
        } else {
            console.log('getPostCommentsAsync error:', err);
        }
        return [];
    }
}

export async function uploadPost(formData: FormData) {
    const BASE_URL = 'https://trustindexscore.com:448/api/';
    let token = '';
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('AuthToken');
    } catch (err) {
        console.log('Error fetching AuthToken from AsyncStorage:', err);
    }
    const url = `${BASE_URL}Post/UploadPostAsync`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Do NOT set Content-Type here; let fetch set it for FormData
            },
            body: formData,
        });
        console.log('uploadPost response status:', response.status);
        const resJson = await response.json();
        console.log('uploadPost response json:', resJson);
        if (!response.ok) throw new Error('Network response was not ok');
        return resJson;
    } catch (err) {
        console.log('uploadPost error:', err);
        return null;
    }
}