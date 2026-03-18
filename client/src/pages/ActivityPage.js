import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import LoadingIndicator from "../components/LoadingIndicator";

// Base path for API calls and assets (set during build via PUBLIC_URL)
const basePath = process.env.PUBLIC_URL || '';

function ActivityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    refreshActivity(page);
  }, [page]);

  const refreshActivity = page => {
    setIsLoading(true);
    setActivities([]);

    fetch(`${basePath}/api/activity/${page}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch(err => {
        console.error('Error loading activity log', err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0px 20px', gap: 10, backgroundColor: '#262626', height: 60 }}>
        <button
          className='hover-blue'
          onClick={() => refreshActivity(page)}
          title="Save Settings">
          <i className="bi bi-arrow-clockwise" />
          <div style={{ fontSize: 'small' }}>Refresh</div>
        </button>
        {/* Todo: maybe add a filter in the future */}
      </div>
      <div style={{ padding: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th />
              <th>Playlist</th>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity =>
              <tr key={activity.id}>
                <td><i className={`bi bi-${activity.icon}`} style={{ color: activity.icon === 'camera-video-fill' ? 'var(--accent-color)' : 'inherit' }} /></td>
                <td className="fixed">
                  {activity.playlist_db_id ?
                    <Link to={`/playlist/${activity.playlist_db_id}`}>{activity.playlist_title}</Link>
                    : <div style={{ fontStyle: 'italic' }}>Playlist deleted</div>}
                </td>{/* Todo: I think we need to trim the title in case it's too long */}
                <td className="fixed"><a href={activity.url} target='_blank' rel="noreferrer">{activity.title}</a></td>{/* Todo: I think we need to trim the title in case it's too long */}
                <td className="expand fixed">{activity.message}</td>
                <td className="fixed">{formatDistance(new Date(activity.datetime), new Date(), { addSuffix: true })}</td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading ?
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingIndicator />
          </div>
          : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === 1}
          onClick={() => setPage(1)}>
          <i className="bi bi-skip-start-fill"></i>
        </button>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}>
          <i className="bi bi-rewind-fill"></i>
        </button>
        <div style={{ margin: '0px 10px' }}>{page} / {totalPages}</div>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}>
          <i className="bi bi-fast-forward-fill"></i>
        </button>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === totalPages}
          onClick={() => setPage(totalPages)}>
          <i className="bi bi-skip-end-fill"></i>
        </button>
      </div>
    </div>
  );
}

export default ActivityPage;
