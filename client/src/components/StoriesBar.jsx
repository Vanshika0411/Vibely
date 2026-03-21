import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import moment from 'moment';
import StoryModal from './StoryModal';
import StoryViewer from './StoryViewer';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const StoriesBar = () => {
    const { getToken } = useAuth();

    const [stories, setStories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewStory, setViewStory] = useState(null);

    const fetchStories = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/story/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStories(data.stories);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        fetchStories();
    }, []);

    return (
        <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-4 pb-5'>
                {/* Create Story Card */}
                <div
                    onClick={() => setShowModal(true)}
                    className='rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white'
                >
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                    </div>
                </div>

                {/* User Stories */}
                {stories.map((story, index) => (
                    <div
                        onClick={() => setViewStory(story)}
                        key={index}
                        className={`relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden`}
                    >
                        {/* Profile Pic */}
                        <img
                            src={story.user.profile_picture}
                            alt=""
                            className='absolute size-8 top-3 left-3 z-20 rounded-full ring ring-gray-100 shadow'
                        />

                        {/* For Text Story */}
                        {story.media_type === "text" && (
                            <div className="h-full w-full bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center p-2">
                                <p className='text-white text-sm text-center truncate'>
                                    {story.content}
                                </p>
                            </div>
                        )}

                        {/* For Image Story */}
                        {story.media_type === "image" && story.media_url && (
                            <img
                                src={story.media_url}
                                alt="story"
                                className="h-full w-full object-cover"
                            />
                        )}

                        {/* For Video Story */}
                        {story.media_type === "video" && story.media_url && (
                            <video
                                src={story.media_url}
                                className="h-full w-full object-cover"
                                muted
                                autoPlay
                                loop
                            />
                        )}

                        {/* Story Timestamp */}
                        <p className='text-white absolute bottom-1 right-2 z-20 text-xs drop-shadow'>
                            {moment(story.createdAt).fromNow()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Story Modal */}
            {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />}

            {/* Story Viewer */}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
        </div>
    );
}

export default StoriesBar;
