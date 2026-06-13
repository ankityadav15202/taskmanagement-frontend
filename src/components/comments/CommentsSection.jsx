import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { commentAPI } from '../../services/taskService';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/helpers';
import { format } from 'date-fns';

const CommentItem = ({ comment, taskId, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const queryClient = useQueryClient();

  const isOwn = comment.author._id === currentUser._id || currentUser.role === 'admin';

  const updateMutation = useMutation({
    mutationFn: () => commentAPI.update(taskId, comment._id, { text: editText }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      setIsEditing(false);
      toast.success('Comment updated.');
    },
    onError: () => toast.error('Failed to update comment.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentAPI.delete(taskId, comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      toast.success('Comment deleted.');
    },
    onError: () => toast.error('Failed to delete comment.'),
  });

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{comment.author.name}</span>
          <span className="text-xs text-slate-400">
            {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
          </span>
          {comment.isEdited && <span className="text-xs text-slate-400">(edited)</span>}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="input resize-none h-20 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="btn-primary text-xs py-1.5" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !editText.trim()}>
                Save
              </button>
              <button className="btn-secondary text-xs py-1.5" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="group flex items-start gap-2">
            <p className="text-sm text-slate-600 flex-1 break-words whitespace-pre-wrap">{comment.text}</p>
            {isOwn && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {comment.author._id === currentUser._id && (
                  <button className="text-xs text-slate-400 dark:text-slate-500 hover:text-brand-600 p-1" onClick={() => setIsEditing(true)}>Edit</button>
                )}
                <button className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 p-1" onClick={() => deleteMutation.mutate()}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentsSection = ({ taskId }) => {
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentAPI.getAll(taskId).then((r) => r.data.data.comments),
  });

  const addMutation = useMutation({
    mutationFn: () => commentAPI.add(taskId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      setText('');
      toast.success('Comment added.');
    },
    onError: () => toast.error('Failed to add comment.'),
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">
        Comments {data?.length > 0 && <span className="text-slate-400 font-normal">({data.length})</span>}
      </h3>

      {/* Add comment */}
      <div className="flex gap-3">
        <Avatar name={user?.name} size="sm" />
        <div className="flex-1 space-y-2">
          <textarea
            className="input resize-none h-20 text-sm"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn-primary text-xs py-1.5"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending || !text.trim()}
          >
            {addMutation.isPending ? 'Posting...' : 'Post comment'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading comments...</p>
      ) : data?.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4 pt-2">
          {data.map((comment) => (
            <CommentItem key={comment._id} comment={comment} taskId={taskId} currentUser={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
