const status = document.getElementById('status');
let csrfToken;
async function request(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options });
  if (response.status === 401) {
    document.getElementById('workspace').hidden = true;
    document.getElementById('sign-in').hidden = false;
    csrfToken = undefined;
    throw new Error('Your session has ended. Please sign in again.');
  }
  if (!response.ok) throw new Error('The service is unavailable. Please try again later.');
  return response.status === 204 ? null : response.json();
}
async function initialize() {
  try {
    const integration = await request('/api/integration-status');
    document.getElementById('login').hidden = integration.authentication !== 'configured';
    const sessionResponse = await fetch('/api/session', { credentials: 'same-origin' });
    if (sessionResponse.status === 401) {
      document.getElementById('sign-in').hidden = false;
      status.textContent = integration.authentication === 'configured' ? 'Ready to sign in.' : 'Sign-in is unavailable while the identity provider is being connected.';
      return;
    }
    if (!sessionResponse.ok) throw new Error('The service is unavailable. Please try again later.');
    const session = await sessionResponse.json();
    csrfToken = session.csrfToken;
    document.getElementById('workspace').hidden = false;
    const preferences = await request('/api/preferences');
    document.getElementById('language').value = preferences.language;
    status.textContent = 'Signed in. Financial services are not yet connected.';
  } catch (error) { status.textContent = error.message; }
}
document.getElementById('preferences').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    await request('/api/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, body: JSON.stringify({ language: document.getElementById('language').value }) });
    status.textContent = 'Preference saved.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
document.getElementById('logout').addEventListener('click', async event => {
  event.target.disabled = true;
  try {
    await request('/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } });
    location.replace('/');
  } catch (error) { status.textContent = error.message; event.target.disabled = false; }
});
initialize();
