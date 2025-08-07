import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const Messages = () => {
    const { userId } = useParams();
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(user);

        // Initialize socket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join', user.id);

        newSocket.on('receive_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        fetchMatches();

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (userId && matches.length > 0) {
            const match = matches.find(m => m.userId._id === userId);
            if (match) {
                setSelectedMatch(match);
                fetchMessages(userId);
            }
        }
    }, [userId, matches]);

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/user/matches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMatches(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Matches fetch error:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Messages fetch error:', error);
            if (error.response?.status === 403) {
                alert('You can only message matched users');
            }
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedMatch) return;

        try {
            const token = localStorage.getItem('token');
            const messageData = {
                receiverId: selectedMatch.userId._id,
                content: newMessage.trim(),
                messageType: 'text'
            };

            const response = await axios.post('http://localhost:5000/api/messages', messageData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, response.data]);

            // Emit to socket for real-time
            socket.emit('send_message', {
                ...response.data,
                receiverId: selectedMatch.userId._id
            });

            setNewMessage('');
        } catch (error) {
            console.error('Send message error:', error);
            if (error.response?.status === 403) {
                alert('You can only message matched users');
            } else {
                alert('Failed to send message');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-400">
                <div className="text-center text-white">
                    <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
                    <p className="text-xl">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-400">
            <div className="flex h-screen">

                {/* Sidebar - Matches List */}
                <div className="w-1/3 overflow-y-auto bg-white border-r">
                    <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="mt-1 text-sm text-white hover:underline"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    <div className="p-4">
                        {matches.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <div className="mb-2 text-4xl">💬</div>
                                <p>No matches to message yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((match, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSelectedMatch(match);
                                            fetchMessages(match.userId._id);
                                            window.history.pushState(null, '', `/messages/${match.userId._id}`);
                                        }}
                                        className={`p-3 rounded-lg cursor-pointer transition duration-200 ${selectedMatch?.userId._id === match.userId._id
                                                ? 'bg-purple-100 border-2 border-purple-300'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
                                                {match.userId.photos && match.userId.photos.length > 0 ? (
                                                    <img
                                                        src={match.userId.photos.find(p => p.isMain)?.url || match.userId.photos[0].url}
                                                        alt={match.userId.firstName}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <span className="text-2xl">👤</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">
                                                    {match.userId.firstName} {match.userId.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{match.userId.major}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-col flex-1">
                    {selectedMatch ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center p-4 space-x-3 bg-white border-b">
                                <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                                    {selectedMatch.userId.photos && selectedMatch.userId.photos.length > 0 ? (
                                        <img
                                            src={selectedMatch.userId.photos.find(p => p.isMain)?.url || selectedMatch.userId.photos[0].url}
                                            alt={selectedMatch.userId.firstName}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <span className="text-xl">👤</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {selectedMatch.userId.firstName} {selectedMatch.userId.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{selectedMatch.userId.major} • {selectedMatch.userId.year}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="py-8 text-center text-white">
                                        <div className="mb-4 text-6xl">💬</div>
                                        <h3 className="mb-2 text-xl font-semibold">Start the conversation!</h3>
                                        <p>You matched with {selectedMatch.userId.firstName}. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((message, index) => (
                                        <div
                                            key={message._id || index}
                                            className={`flex ${message.sender._id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender._id === currentUser.id
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-white text-gray-800'
                                                    }`}
                                            >
                                                <p>{message.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-xs mt-1 ${message.sender._id === currentUser.id ? 'text-purple-200' : 'text-gray-500'
                                                        }`}>
                                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {message.sender._id === currentUser.id && (
                                                        <span className={`text-xs ${message.isRead ? 'text-purple-200' : 'text-purple-300'}`}>
                                                            {message.isRead ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t">
                                <form onSubmit={sendMessage} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message ${selectedMatch.userId.firstName}...`}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center flex-1 text-white">
                            <div className="text-center">
                                <div className="mb-4 text-8xl">💬</div>
                                <h2 className="mb-2 text-2xl font-bold">Select a match to start chatting</h2>
                                <p className="text-lg">Choose someone from your matches to begin a conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
