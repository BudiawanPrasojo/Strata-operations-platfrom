import { User, Bell, Shield, Monitor, Database, Save, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardHeader } from '../components/common/Card';

const PROFILE_KEY  = 'strata_profile_settings';
const TOGGLES_KEY  = 'strata_toggle_settings';

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? 'bg-industrial-500' : 'bg-graphite-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

const notificationToggles = [
  { label: 'Equipment Alerts',          description: 'Health and maintenance warnings',        default: true  },
  { label: 'Safety Notifications',      description: 'Fatigue and incident alerts',            default: true  },
  { label: 'Fuel Anomaly Alerts',       description: 'Suspicious fuel loss detection',         default: true  },
  { label: 'AI Insight Notifications',  description: 'New AI-generated recommendations',       default: true  },
  { label: 'Production Reports',        description: 'Daily and weekly summaries',             default: false },
  { label: 'System Maintenance',        description: 'Scheduled downtime alerts',              default: true  },
];

const displayToggles = [
  { label: 'Dark Mode',            description: 'Use dark theme (default)',        default: true  },
  { label: 'Compact View',         description: 'Reduce spacing and padding',      default: false },
  { label: 'Show Grid Lines',      description: 'Display chart grid lines',        default: true  },
  { label: 'Animate Transitions',  description: 'Enable UI animations',            default: true  },
];

const securityToggles = [
  { label: 'Two-Factor Authentication', description: 'Require 2FA for login',                        default: true  },
  { label: 'Session Timeout',           description: 'Auto-logout after 30 minutes of inactivity',   default: true  },
  { label: 'IP Whitelisting',           description: 'Restrict access to approved IPs',              default: false },
];

// Build default toggle state object from toggle arrays
function buildDefaultToggles() {
  const s = {};
  notificationToggles.forEach((t, i) => { s[`notifications-${i}`] = t.default; });
  displayToggles.forEach((t, i)      => { s[`display-${i}`]       = t.default; });
  securityToggles.forEach((t, i)     => { s[`security-${i}`]      = t.default; });
  return s;
}

// Load toggle state from localStorage; merge with defaults so new keys always exist
function loadToggleState() {
  try {
    const saved = JSON.parse(localStorage.getItem(TOGGLES_KEY));
    return saved ? { ...buildDefaultToggles(), ...saved } : buildDefaultToggles();
  } catch {
    return buildDefaultToggles();
  }
}

export default function Settings() {
  const { user } = useAuth();

  // Profile — load saved or fall back to auth data
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
  })();

  const emailFromAuth = user?.email || '';
  const nameFromAuth  = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || emailFromAuth.split('@')[0]
    || 'User';

  const [displayName, setDisplayName] = useState(savedProfile.displayName ?? nameFromAuth);
  const [email,       setEmail]       = useState(savedProfile.email       ?? emailFromAuth);
  const [timezone,    setTimezone]    = useState(savedProfile.timezone    ?? 'UTC+8 (WITA)');
  const [saveStatus,  setSaveStatus]  = useState(null); // null | 'saved'

  // Toggles — persisted in their own key so they survive refresh
  const [toggleStates, setToggleStates] = useState(loadToggleState);

  const handleToggle = (key, value) => {
    setToggleStates(prev => {
      const next = { ...prev, [key]: value };
      // Persist immediately on each toggle change
      localStorage.setItem(TOGGLES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSave = () => {
    const profileData = { displayName, email, timezone };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    // Also persist toggles explicitly on Save
    localStorage.setItem(TOGGLES_KEY, JSON.stringify(toggleStates));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleReset = () => {
    setDisplayName(nameFromAuth);
    setEmail(emailFromAuth);
    setTimezone('UTC+8 (WITA)');
    const defaults = buildDefaultToggles();
    setToggleStates(defaults);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TOGGLES_KEY);
    setSaveStatus(null);
  };

  const renderToggles = (list, prefix) =>
    list.map((toggle, i) => {
      const key = `${prefix}-${i}`;
      return (
        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-graphite-800/20 border border-graphite-700/20">
          <div>
            <p className="text-sm font-medium text-graphite-200">{toggle.label}</p>
            <p className="text-xs text-graphite-500 mt-0.5">{toggle.description}</p>
          </div>
          <ToggleSwitch enabled={toggleStates[key]} onChange={val => handleToggle(key, val)} />
        </div>
      );
    });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gradient">Settings</h1>
        <p className="text-sm text-graphite-400 mt-1">Configure platform preferences and system settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader title="Profile Settings" icon={User} />
        <div className="space-y-4">
          {[
            { label: 'Display Name', value: displayName, onChange: setDisplayName },
            { label: 'Email',        value: email,       onChange: setEmail       },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-sm text-graphite-400 sm:w-40 flex-shrink-0">{label}</label>
              <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-sm text-graphite-200 outline-none focus:border-industrial-500/40 transition-colors"
              />
            </div>
          ))}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm text-graphite-400 sm:w-40 flex-shrink-0">Role</label>
            <input type="text" value="Operations Manager" disabled
              className="flex-1 px-3 py-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-sm text-graphite-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm text-graphite-400 sm:w-40 flex-shrink-0">Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-sm text-graphite-200 outline-none focus:border-industrial-500/40 transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader title="Notification Preferences" icon={Bell} />
        <div className="space-y-3">{renderToggles(notificationToggles, 'notifications')}</div>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader title="Display Settings" icon={Monitor} />
        <div className="space-y-3">{renderToggles(displayToggles, 'display')}</div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader title="Security" icon={Shield} />
        <div className="space-y-3">{renderToggles(securityToggles, 'security')}</div>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader title="System Information" icon={Database} />
        <div className="space-y-2">
          {[
            { label: 'Platform Version', value: 'STRATA v2.4.1'          },
            { label: 'API Status',       value: 'Connected'             },
            { label: 'Data Sync',        value: 'Real-time'             },
            { label: 'Last Backup',      value: '2024-01-15 06:00 UTC'  },
            { label: 'Storage Used',     value: '2.4 GB / 50 GB'        },
          ].map(info => (
            <div key={info.label} className="flex items-center justify-between py-2 border-b border-graphite-800/30 last:border-0">
              <span className="text-sm text-graphite-400">{info.label}</span>
              <span className="text-sm font-medium text-graphite-200">{info.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Save feedback */}
      {saveStatus === 'saved' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium">
          <CheckCircle size={16} />
          Profile and settings saved successfully.
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-sm text-graphite-400 hover:text-graphite-200 transition-colors"
        >
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-industrial-500 text-white text-sm font-medium hover:bg-industrial-400 transition-colors"
        >
          <Save size={14} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
