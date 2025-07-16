export async function getAllPost(userId: string, pageNumber: number, isGroupOnly: number) {
    const BASE_URL = 'https://trustindexscore.com:448/api/'; // Replace with your actual base URL
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
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.log('getAllPost error:', err);
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