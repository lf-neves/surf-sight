'use client';

import { motion } from 'motion/react';
import { MessageCircle, ThumbsUp, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  time: string;
  comment: string;
  likes: number;
  condition: 'good' | 'okay' | 'bad';
}

export function RealtimeComments() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: 'Carlos Silva',
      avatar: '🏄‍♂️',
      time: 'há 5 min',
      comment: 'Ondas excelentes! 1.5m com offshore perfeito. Crowd moderado.',
      likes: 12,
      condition: 'good'
    },
    {
      id: 2,
      user: 'Marina Costa',
      avatar: '🏄‍♀️',
      time: 'há 15 min',
      comment: 'Acabei de sair da água. Sessão épica! Tubos na pedra do Arpoador 🔥',
      likes: 24,
      condition: 'good'
    },
    {
      id: 3,
      user: 'Pedro Santos',
      avatar: '🤙',
      time: 'há 30 min',
      comment: 'Crowd pesado, mas vale a pena. Melhor período da manhã.',
      likes: 8,
      condition: 'okay'
    },
    {
      id: 4,
      user: 'Julia Almeida',
      avatar: '🌊',
      time: 'há 1h',
      comment: 'Maré enchendo agora, ondas começando a melhorar. Vem!',
      likes: 15,
      condition: 'good'
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const handleLike = (id: number) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      user: 'Você',
      avatar: '🏄',
      time: 'agora',
      comment: newComment,
      likes: 0,
      condition: 'good'
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">Comentários ao Vivo</h2>
            <p className="text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {comments.length} surfistas comentando
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* New Comment Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xl">
            🏄
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Como estão as condições agora?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-cyan-400 focus:outline-none transition-all"
            />
          </div>
          <motion.button
            onClick={handlePostComment}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Postar
          </motion.button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              {comment.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900">{comment.user}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {comment.time}
                </span>
                {comment.condition === 'good' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    ✓ Boas
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm mb-2">{comment.comment}</p>
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-cyan-600 transition-colors text-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </motion.button>
                <button className="text-sm text-gray-500 hover:text-cyan-600 transition-colors">
                  Responder
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Última atualização: há 2 min
        </div>
        <motion.button
          className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          whileHover={{ x: 2 }}
        >
          Ver todos os comentários
          <TrendingUp className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
