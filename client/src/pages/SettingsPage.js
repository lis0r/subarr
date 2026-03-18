import { useEffect, useState } from 'react';
import PostProcessorDialog from '../components/PostProcessorDialog';
import { showToast } from '../utils/utils';

// Base path for API calls and assets (set during build via PUBLIC_URL)
const basePath = process.env.PUBLIC_URL || '';

function SettingsPage() {
  const [ytsubsApiKey, setYtsubsApiKey] = useState('');
  const [excludeShorts, setExcludeShorts] = useState(false);
  const [postProcessors, setPostProcessors] = useState([]);

  const [editingPostProcessor, setEditingPostProcessor] = useState(null);

  const defaultWebhook = {
    name: '',
    type: 'webhook',
    target: '',
    data: "{\"method\":\"GET\"}", // Todo
  };

  useEffect(() => {
    refreshPostProcessors();

    fetch(`${basePath}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setYtsubsApiKey(data.ytsubs_apikey ?? '');
        setExcludeShorts((data.exclude_shorts ?? 'false') === 'true'); // SQLite can't store bool
      })
      .catch(err => {
        console.error('Failed to fetch settings', err);
      });
  }, []);

  const refreshPostProcessors = async () => {
    try {
      const res = await fetch(`${basePath}/api/postprocessors`);
      setPostProcessors(await res.json());
    }
    catch (err) {
      console.error('Failed to fetch postprocessors', err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${basePath}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ytsubs_apikey: ytsubsApiKey,
          exclude_shorts: String(excludeShorts), // SQLite can't store bool
        }),
      });

      if (!res.ok)
        throw new Error('Failed to save settings');

      showToast('Saved settings', 'success');
    }
    catch (err) {
      console.error(err);
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0px 20px', gap: 10, backgroundColor: '#262626', height: 60 }}>
        <button
          className='hover-blue'
          onClick={handleSave}
          title="Save Settings"
        >
          <i className="bi bi-floppy-fill" />
          <div style={{ fontSize: 'small' }}>Save</div>
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' /* Todo: not sure why this has to be 120 and not 60 */, padding: 30 }}>
        <div style={{ fontWeight: 'bold', fontSize: 'xx-large' }}>
          Settings
        </div>
        <div className='setting flex-column-mobile'>
          <div style={{ minWidth: 175 }}>YTSubs.app API key</div>
          <input type="text"
            value={ytsubsApiKey}
            onChange={e => setYtsubsApiKey(e.target.value)}
          />
        </div>
        <div className='setting flex-column-mobile'>
          {/* Todo: maybe instead of just "exclude shorts", we could let users choose from one of these prefixes: https://stackoverflow.com/a/77816885*/}
          <div style={{ minWidth: 175 }}>Exclude shorts</div>
          <label className='container'>
            <div style={{ fontSize: 'small', textAlign: 'center' }}>Whether to exclude shorts videos from playlists</div>
            <input type='checkbox' checked={excludeShorts} onChange={e => setExcludeShorts(e.target.checked)} />
            <span className="checkmark"></span>
          </label>
        </div>
        {/* Todo: eventually, I think "Post Processors" should be a separate page under Settings (like Sonarr's "Connect") */}
        <div style={{ marginTop: 50, fontWeight: 'bold', fontSize: 'xx-large' }}>
          Post Processors
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: 10,
        }}>
          {postProcessors.map(postProcessor =>
            <div key={postProcessor.id} className='card' style={{ padding: 10 }}>
              <button onClick={() => setEditingPostProcessor(postProcessor)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%', height: '100%' }}>
                <h3 style={{ fontSize: 'x-large', margin: '0 0 5px 0', }}>{postProcessor.name}</h3>
                <div style={{ display: 'flex', backgroundColor: 'var(--accent-color)', padding: 5, margin: 10, gap: 5, borderRadius: 2 }}>
                  <i style={{ fontSize: 'medium' }} className={`bi bi-${postProcessor.type === 'webhook' ? 'broadcast' : 'cpu-fill'}`} />
                  <div style={{ fontSize: 'small' }}>{postProcessor.type}</div>
                </div>
              </button>
            </div>
          )}
          <div className='card' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            <button style={{ width: '100%', height: '100%' }} onClick={() => setEditingPostProcessor(defaultWebhook)}>
              <i style={{ fontSize: 'xx-large' }} className="bi bi-plus-square" />
            </button>
          </div>
        </div>
        <br />
        <PostProcessorDialog editingItem={editingPostProcessor} onClose={() => setEditingPostProcessor(null)} onRefreshPostProcessors={() => refreshPostProcessors()} />
        <div style={{ flexGrow: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a style={{ height: 36 }} href='https://ko-fi.com/E1E5RZJY' target='_blank' rel='noreferrer'>
            <img height='36' style={{ border: 0, height: 36 }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
          </a>
          <a href='https://github.com/derekantrican/subarr' target='_blank' rel='noreferrer'>
            <i style={{ height: 36, width: 36, fontSize: '36px', color: 'white', textAlign: 'center' }} className='bi bi-github' />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
