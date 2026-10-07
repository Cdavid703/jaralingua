(() => {
  'use strict';
  const $ = id => document.getElementById('pc-' + id);
  const titles = ['The beginning of my trip', 'My vacation experience', 'A memorable moment'];
  const prompts = ['Where did you go? When? Who traveled with you?', 'What did you do? What were the place and the weather like?', 'What funny or embarrassing thing happened? How did you feel? How did it end?'];
  let user = null, state = null, team = null, epoch = 0, dirty = false, saving = null, saveTimer = null, conflict = null, busy = false, recovery = false, pending = null;
  let selectedMembers = [], loading = false, previewMode = false, previewStudent = 'preview-1';
  const node = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const sid = () => previewMode ? previewStudent : state?.student?.id;
  const isStaff = () => ['teacher', 'admin'].includes(state?.role);
  const count = text => (text.match(/[\p{L}\p{N}_]+(?:['’\-][\p{L}\p{N}_]+)*/gu) || []).length;
  const localKey = kind => `basic2-final-postcard:${String(user?.email || user?.sub || '').toLowerCase()}:${team?.id}:${kind}`;
  function localGet(kind) { try { return JSON.parse(localStorage.getItem(localKey(kind)) || 'null'); } catch { return null; } }
  function localPut(kind, data) { try { localStorage.setItem(localKey(kind), JSON.stringify(data)); } catch { $('save').textContent = 'Device backup is unavailable. Keep this page open and save to the server.'; } }
  function localRemove(kind) { try { localStorage.removeItem(localKey(kind)); } catch {} }
  const messages = {
    exam_closed: 'The exam is closed. Your teacher will open it.', team_not_assigned: 'Start your individual exam when access is open.',
    account_not_linked: 'This account is not linked to Basic English 2. Ask your teacher for help.', choose_one_student: 'Select exactly one student.', assessment_complete: 'Your final writing grade is already recorded.',
    student_already_assigned: 'A selected student already belongs to a team. Refresh the list.', complete_all_parts: 'Complete the three sections before confirming your postcard.',
    everyone_must_confirm: 'Every member must review and confirm this version from their own account.', team_changed: 'The postcard changed in another tab. Review the updated version and try again.',
    draft_conflict: 'Another tab changed your writing. Choose which version to keep.', review_changed: 'This review changed elsewhere. Refresh before grading again.',
    already_submitted: 'Your postcard has already been submitted. Refresh to see the receipt.', submission_changed: 'The submission has changed. Refresh the teacher workspace.',
    exam_temporarily_unavailable: 'The exam service is temporarily unavailable. Your device draft is kept; try again.',
    graded_team_cannot_reopen: 'This team already has a grade. Reopening is unavailable.', team_already_started: 'This team has already started and cannot be removed.',
    invalid_text: 'Check the required text fields and their length.', invalid_rubric: 'Choose a score from 1 to 10 for every criterion.',
    wrong_team: 'Your exam assignment changed. Refresh access.', start_first: 'Start your exam before writing.'
  };
  function errorText(e) { return e.status === 401 ? 'Your session expired. Reconnect with the same account to continue.' : e.name === 'AbortError' ? 'The request timed out. Your work is kept. Please retry.' : messages[e.code] || e.message || 'Connection failed. Try again.'; }
  function report(e, id = 'status') { if (e.code !== 'session_changed') $(id).textContent = errorText(e); }
  async function request(action, payload) {
    if (previewMode && payload !== undefined) throw new Error('Teacher preview does not send changes to the server.');
    if (!user?.credential) throw new Error('Sign in with your course account.');
    const token = epoch, abort = new AbortController(), timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch('/api/basic2/final-postcard/' + action, { method: payload === undefined ? 'GET' : 'POST', signal: abort.signal, cache: 'no-store',
        headers: { Authorization: 'Bearer ' + user.credential, 'X-Jaralingua-Auth-Provider': user.provider || 'google', ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
      const data = await response.json();
      if (token !== epoch) throw Object.assign(new Error('Account changed'), { code: 'session_changed' });
      if (!response.ok) {
        if (response.status === 401) { backup(); recovery = true; $('reconnect').hidden = false; clearTimeout(saveTimer); }
        throw Object.assign(new Error(data.error || 'Request failed'), { code: data.error, status: response.status, data });
      }
      return data;
    } finally { clearTimeout(timeout); }
  }
  function myParts() {
    return Object.fromEntries((team?.parts || []).flatMap((p, i) => p.author === sid() ? [[String(i), { text: $('part-' + i)?.value ?? p.text, revision: p.revision }]] : []));
  }
  function backup() { if (dirty && team && user && !isStaff()) localPut('draft', { teamId: team.id, parts: myParts(), savedAt: Date.now() }); }
  function preview() {
    if (!team) return;
    const texts = team.parts.map((p, i) => p.author === sid() ? $('part-' + i)?.value ?? p.text : p.text);
    $('preview-text').replaceChildren(...texts.map(t => node('p', t || '…')));
    $('words').textContent = count(texts.join(' ')) + ' words · Aim for about 120';
    $('preview-image').src = state.pictures[team.picture];
    $('signatures').textContent = team.members.map(m => m.name).join(', ');
  }
  function clock() {
    if (previewMode) { $('time').textContent = '48:00:00 · Preview — timer paused'; return; }
    if (!team?.deadline || team.status !== 'writing') { $('time').textContent = ''; return; }
    const seconds = Math.max(0, Math.ceil((Date.parse(team.deadline) - Date.now()) / 1000));
    $('time').textContent = seconds ? 'Time left: ' + Math.floor(seconds / 3600) + ':' + String(Math.floor(seconds / 60) % 60).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0') : 'Time is up. You can still send your work; the teacher will see that it arrived late.';
  }
  function receipt() {
    $('writing').hidden = true; $('start').hidden = true; $('receipt').hidden = false;
    $('receipt-text').textContent = `Receipt ${team.receiptId} · ${new Date(team.submittedAt).toLocaleString()} · Received for ${team.members.map(m => m.name).join(', ')}.`;
    const result = team.reviews[sid()]; $('result').replaceChildren();
    $('result').append(node('p', result ? `Your grade: ${result.grade.toFixed(1)} / 5` : 'Waiting for teacher review. No final grade has been assigned yet.'));
    if (result) $('result').append(node('p', result.feedback));
    const details = node('details'); details.append(node('summary', 'Read the submitted postcard'), ...team.parts.map(p => node('p', p.text))); $('result').append(details);
    dirty = false; pending = null; localRemove('draft'); localRemove('pending');
  }
  function studentView(force = false) {
    $('admin').hidden = true; $('student').hidden = !team && !state?.student;
    if (!previewMode && !state.student) { $('status').textContent = messages.account_not_linked; return; }
    if (!team) {
      $('status').textContent = state.assessmentComplete ? messages.assessment_complete : state.isOpen ? 'Individual exam · Write and submit your own complete postcard.' : messages.exam_closed;
      $('team-heading').textContent = 'My final writing exam'; $('members').textContent = state.student.fullName;
      $('start').hidden = state.assessmentComplete; $('start').disabled = !state.canStart || busy;
      $('writing').hidden = true; $('receipt').hidden = true; $('time').textContent = ''; return;
    }
    $('status').textContent = team.status === 'submitted' ? 'Your delivery is confirmed.' : state.isOpen ? 'Exam access is open.' : team.startedAt ? 'New starts are closed. You can finish and submit.' : messages.exam_closed;
    if (previewMode) $('status').textContent = 'Teacher preview · The real exam remains ' + (state.isOpen ? 'open.' : 'closed.');
    $('team-heading').textContent = team.name + ' · ' + team.courseCode;
    $('members').textContent = team.members.map(m => m.name).join(' · ');
    $('start').hidden = team.status !== 'assigned'; $('start').disabled = !state.isOpen || busy;
    $('writing').hidden = team.status !== 'writing'; $('receipt').hidden = team.status !== 'submitted';
    clock(); if (team.status === 'submitted') { receipt(); return; }
    if (team.status !== 'writing') return;
    if (force || !$('parts').children.length) {
      $('parts').replaceChildren();
      team.parts.forEach((p, i) => {
        const card = node('section', undefined, 'pc-part'); card.append(node('h3', (i + 1) + '. ' + titles[i]), node('p', prompts[i]));
        const author = team.members.find(m => m.id === p.author)?.name || '';
        card.append(node('p', (team.members.length === 1 ? 'Your writing' : 'Previously assigned to ' + author)));
        if (p.author === sid()) {
          const label = node('label', 'Write this section'), input = node('textarea'); input.id = 'pc-part-' + i; input.maxLength = 5000; input.spellcheck = false; input.autocomplete = 'off'; input.value = p.text; label.htmlFor = input.id; label.append(input); card.append(label);
          input.oninput = () => { if (previewMode) { capturePreview(); team.ready = []; preview(); $('save').textContent = 'Preview writing only — nothing is saved to the server.'; $('ready').disabled = false; $('ready-status').textContent = 'Preview: writing changed. Review the postcard again.'; return; } dirty = true; backup(); preview(); $('save').textContent = 'Unsaved changes — saving shortly…'; clearTimeout(saveTimer); if (!recovery) saveTimer = setTimeout(() => save().catch(() => {}), 900); };
        } else { const text = node('p', p.text || 'Waiting for your teammate to write.', 'pc-other'); text.id = 'pc-other-' + i; card.append(text); }
        $('parts').append(card);
      });
    } else {
      team.parts.forEach((p, i) => { if (p.author !== sid()) $('other-' + i).textContent = p.text || 'Waiting for your teammate to write.'; else if (!dirty && !saving) $('part-' + i).value = p.text; });
    }
    $('picture').value = team.picture; $('fields').disabled = busy || Boolean(pending);
    $('ready-status').textContent = team.members.length === 1 ? (team.ready.includes(sid()) ? 'Your review is confirmed.' : 'Read your complete postcard, then confirm your review.') + ' Any writing or picture change requires you to confirm again.' : 'Reviewed by: ' + (team.members.filter(m => team.ready.includes(m.id)).map(m => m.name).join(', ') || 'No one yet.') + ' Any change requires the original authors to confirm again.';
    $('ready').disabled = busy || team.ready.includes(sid()) || Boolean(pending);
    $('submit').disabled = busy; $('submit').textContent = pending ? 'Retry and confirm delivery' : 'Send my postcard to the teacher';
    preview();
  }
  async function save() {
    if (previewMode) { capturePreview(); $('save').textContent = 'Preview only — no real draft was saved.'; return; }
    if (!team || team.status !== 'writing' || recovery || conflict || pending) return;
    if (saving) { await saving; if (dirty) return save(); return; }
    if (!dirty) return;
    backup(); const payload = { teamId: team.id, parts: myParts() }, token = epoch;
    dirty = false; $('save').textContent = 'Saving…';
    saving = (async () => {
      try {
        const r = await request('draft', payload); if (token !== epoch) return;
        team = r.team;
        if (!dirty) { localRemove('draft'); $('save').textContent = 'Your writing is saved on the server.'; }
        else { backup(); $('save').textContent = 'New changes waiting to save…'; }
        studentView();
      } catch (e) {
        if (token !== epoch) return; dirty = true; backup();
        if (e.code === 'draft_conflict') { conflict = e.data.team; $('conflict').hidden = false; }
        $('save').textContent = errorText(e); throw e;
      } finally { if (token === epoch) saving = null; }
    })();
    return saving;
  }
  async function restore() {
    if (team?.status !== 'writing') return;
    pending = localGet('pending');
    const draft = localGet('draft');
    if (draft?.teamId === team.id && Object.entries(draft.parts).some(([i, p]) => p.text.trim() !== team.parts[Number(i)]?.text) && confirm('This device has writing that may not have reached the server. Restore it?')) {
      for (const [i, p] of Object.entries(draft.parts)) if ($('part-' + i)) $('part-' + i).value = p.text;
      dirty = true;
      if (Object.entries(draft.parts).some(([i, p]) => p.revision !== team.parts[Number(i)]?.revision)) { conflict = team; $('conflict').hidden = false; }
      else await save().catch(() => {});
    }
    studentView();
  }
  function button(text, fn, secondary = false) { const b = node('button', text, secondary ? 'pc-secondary' : undefined); b.type = 'button'; b.onclick = fn; return b; }
  function capturePreview() {
    if (!previewMode || !team) return;
    team.parts.forEach((p, i) => { if (p.author === previewStudent && $('part-' + i)) p.text = $('part-' + i).value; });
  }
  function startPreview() {
    if (!isStaff()) return;
    clearTimeout(saveTimer); previewMode = true; previewStudent = 'preview-1'; dirty = false; pending = null; conflict = null;
    team = { id: 'preview-only', name: 'Individual exam preview', courseCode: 'DEMO', status: 'writing', startedAt: null, deadline: null,
      members: [{ id: 'preview-1', name: 'Student preview' }],
      parts: [1,2,3].map(n => ({ author: 'preview-1', text: '', revision: 0 })), picture: 'coast', ready: [], reviews: {} };
    $('preview-controls').hidden = false; $('preview-student').value = previewStudent;
    $('conflict').hidden = true; $('delivery-status').textContent = '';
    $('save').textContent = 'Preview only — your test writing will be discarded when you leave.';
    studentView(true); $('preview-controls').scrollIntoView({ block: 'start' });
  }
  function endPreview() {
    if (!previewMode) return;
    previewMode = false; team = null; dirty = false; pending = null; conflict = null; clearTimeout(saveTimer);
    $('preview-controls').hidden = true; $('student').hidden = true; $('parts').replaceChildren(); $('preview-text').replaceChildren();
    $('save').textContent = ''; $('delivery-status').textContent = ''; $('time').textContent = '';
    $('admin').hidden = !isStaff();
    $('status').textContent = (state.isOpen ? 'Open' : 'Closed') + ' · ' + state.teams.length + ' submissions';
    $('preview').focus();
  }
  function teacherView() {
    $('admin').hidden = false; $('student').hidden = true;
    $('status').textContent = (state.isOpen ? 'Open' : 'Closed') + ' · ' + state.teams.length + ' submissions';
    $('open').disabled = state.isOpen; $('close').disabled = !state.isOpen;
    selectedMembers = [];
    $('roster').replaceChildren(...state.roster.filter(s => !s.assigned).map(s => {
      const label = node('label'), check = node('input'); check.type = 'radio'; check.name = 'individual-student'; check.value = s.id;
      check.onchange = () => { selectedMembers = check.checked ? [s.id] : [];
        $('assignment').textContent = selectedMembers.map((id, i) => `${state.roster.find(m => m.id === id).name}: ${'all three sections'}`).join(' · '); };
      label.append(check, node('span', s.name)); return label;
    }));
    $('assignment').textContent = 'Optional: assign one student. Students can also start directly with their own account.';
    $('teams').replaceChildren();
    state.teams.forEach(t => {
      const card = node('article', undefined, 'pc-review'); card.append(node('h3', t.name + ' · ' + t.courseCode), node('p', t.members.map(m => m.name).join(' · ')));
      card.append(node('p', t.status === 'submitted' ? `Received · ${t.receiptId} · ${t.wordCount} words${t.late ? ' · Late delivery' : ''}` : t.status === 'writing' ? 'In progress' : 'Waiting to start'));
      const details = node('details'); details.append(node('summary', t.status === 'submitted' ? 'Read postcard and grade each member' : 'View writing assignments'));
      t.parts.forEach((p, i) => details.append(node('h4', titles[i] + ' — ' + t.members.find(m => m.id === p.author).name), node('pre', p.text || 'No writing yet.')));
      if (t.status === 'submitted') t.members.forEach(m => {
        const review = t.reviews[m.id], form = node('form'), rubric = node('div', undefined, 'pc-rubric'); form.dataset.jaralinguaManagedDraft = '';
        form.append(node('h4', 'Individual assessment — ' + m.name));
        Object.entries(state.rubric).forEach(([key, title]) => { const label = node('label', title), select = node('select'); select.name = key; select.required = true; select.add(new Option('Score /10', '')); for (let n = 1; n <= 10; n++) select.add(new Option(n, n)); select.value = review?.rubric[key] ?? ''; label.append(select); rubric.append(label); });
        const label = node('label', 'Individual feedback'), feedback = node('textarea'); feedback.required = true; feedback.maxLength = 6000; feedback.value = review?.feedback || ''; label.append(feedback);
        const submit = node('button', 'Save individual grade'), status = node('p'); status.setAttribute('role', 'status'); submit.type = 'submit'; form.append(rubric, label, submit, status);
        let reviewRevision = review?.revision || 0;
        form.onsubmit = async e => { e.preventDefault(); submit.disabled = true;
          try { const result = await request('grade', { teamId: t.id, receiptId: t.receiptId, studentId: m.id, reviewRevision,
            rubric: Object.fromEntries([...rubric.querySelectorAll('select')].map(s => [s.name, Number(s.value)])), feedback: feedback.value });
            reviewRevision = result.team.reviews[m.id].revision;
            status.textContent = `Grade saved: ${result.team.reviews[m.id].grade.toFixed(1)} / 5.` + (result.gradebookSynced === false ? ' Grade-grid sync will retry when Grades is opened.' : ' Updated in Grades.');
          } catch (error) { status.textContent = errorText(error); } finally { submit.disabled = false; }
        }; details.append(form);
      });
      if (t.status === 'assigned') card.append(button('Remove unstarted team', async () => { if (!confirm('Remove this unstarted team so its members can be reassigned?')) return; try { await request('delete-team', { teamId: t.id }); await load(); } catch (e) { report(e); } }, true));
      if (t.status === 'submitted' && !Object.keys(t.reviews).length) card.append(button('Reopen for corrections', async () => { if (!confirm('Reopen this team’s postcard? Everyone must review and submit again. The previous delivery will be retained in the history.')) return; try { await request('reopen', { teamId: t.id, receiptId: t.receiptId }); await load(); } catch (e) { report(e); } }, true));
      card.append(details); $('teams').append(card);
    });
  }
  async function load() {
    if (previewMode) { endPreview(); return; }
    if (!user?.credential) { $('status').textContent = 'Sign in with your course account.'; return; }
    const token = epoch; loading = true; $('refresh').disabled = true; $('fields').disabled = true;
    try {
      if (dirty) { await save(); if (dirty) return; }
      state = await request('state'); recovery = false; $('reconnect').hidden = true;
      if (isStaff()) { teacherView(); return; }
      team = state.team || null; studentView(true); await restore();
    } finally { if (token === epoch) { loading = false; $('refresh').disabled = false; $('fields').disabled = busy || Boolean(pending); } }
  }
  async function action(name, extra = {}) {
    if (previewMode) {
      capturePreview();
      if (name === 'picture') { team.picture = extra.picture; team.ready = []; }
      if (name === 'ready' && !team.ready.includes(sid())) team.ready.push(sid());
      studentView();
      $('delivery-status').textContent = name === 'submit' ? 'Preview only — the Submit button works. No exam was sent, no receipt was created and no grades were changed.' : name === 'ready' ? 'Preview review confirmed. No student record was changed.' : '';
      return;
    }
    if (busy || conflict || recovery) return;
    busy = true; clearTimeout(saveTimer); $('submit').disabled = true; $('ready').disabled = true; $('fields').disabled = true;
    try {
      if (!pending) { await save(); if (dirty || conflict) throw new Error('Save your writing successfully before continuing.'); }
      let payload = { ...(team ? { teamId: team.id, revision: team.revision } : {}), ...extra };
      if (name === 'submit') {
        if (!pending) {
          const n = count(team.parts.map(p => p.text).join(' '));
          const allowLength = n < 100 || n > 150;
          if (!confirm(`${team.members.length === 1 ? "Send your individual postcard?" : "Send the existing postcard for its original authors?"}${allowLength ? ' It has ' + n + ' words; the target is about 120. Your teacher will review the length.' : ''}`)) return;
          payload = { ...payload, requestId: crypto.randomUUID(), allowLength }; pending = payload; localPut('pending', pending);
        } else payload = pending;
        $('delivery-status').textContent = 'Sending… Wait for the receipt.';
      }
      const result = await request(name, payload); team = result.team;
      if (name === 'submit') { pending = null; localRemove('pending'); }
      $('delivery-status').textContent = name === 'ready' ? 'Your review is confirmed.' : '';
      studentView(name === 'start');
    } catch (e) {
      if (e.status && e.status !== 401 && e.status < 500 && name === 'submit') { pending = null; localRemove('pending'); }
      if (e.code === 'team_changed') { team = e.data.team; studentView(); }
      report(e, 'delivery-status');
      if (pending) $('delivery-status').textContent += ' Delivery is not yet confirmed. Use Retry to check the same delivery.';
    } finally { busy = false; if (state && !isStaff()) studentView(); }
  }
  $('form').onsubmit = e => e.preventDefault();
  $('preview').onclick = startPreview;
  $('preview-exit').onclick = endPreview;
  $('preview-student').onchange = () => { if (!previewMode) return; capturePreview(); previewStudent = $('preview-student').value; studentView(true); };
  $('save-button').onclick = () => save().catch(e => report(e, 'save'));
  $('refresh').onclick = () => load().catch(e => report(e));
  $('login').onclick = () => window.JaraLinguaAuth?.openPanel();
  const syncLogin = () => { $('login').parentElement.hidden = Boolean(document.querySelector('.jaralingua-auth-nav .auth-trigger')); };
  new MutationObserver(syncLogin).observe(document.querySelector('.navbar'), { childList: true, subtree: true });
  syncLogin();
  $('reconnect-button').onclick = () => { backup(); if (pending) localPut('pending', pending); document.querySelector('[data-auth-signout]')?.click(); window.JaraLinguaAuth?.openPanel(); };
  $('start').onclick = () => action('start'); $('ready').onclick = () => action('ready'); $('submit').onclick = () => action('submit');
  $('picture').onchange = () => action('picture', { picture: $('picture').value });
  $('server').onclick = () => { team = conflict; conflict = null; dirty = false; localRemove('draft'); $('conflict').hidden = true; studentView(true); };
  $('local').onclick = () => { team = conflict; conflict = null; $('conflict').hidden = true; dirty = true; backup(); save().catch(e => report(e, 'save')); };
  for (const [id, isOpen] of [['open', true], ['close', false]]) $(id).onclick = async () => { $(id).disabled = true; try { await request('availability', { isOpen }); await load(); } catch (e) { report(e); $(id).disabled = false; } };
  $('team-form').onsubmit = async e => { e.preventDefault(); const submit = e.currentTarget.querySelector('button[type=submit]'); submit.disabled = true;
    try { await request('create-team', { name: $('team-name').value, courseCode: $('course').value, members: selectedMembers }); $('create-status').textContent = 'Individual assignment created.'; $('team-name').value = ''; await load(); }
    catch (error) { report(error, 'create-status'); } finally { submit.disabled = false; }
  };
  function authChanged() {
    backup(); epoch++; clearTimeout(saveTimer); user = window.JaraLinguaAuth?.getUser() || window.JaraLinguaCurrentUser || null;
    state = null; team = null; dirty = false; saving = null; pending = null; conflict = null; busy = false; recovery = false; loading = false; previewMode = false;
    $('preview-controls').hidden = true; $('refresh').disabled = false;
    $('admin').hidden = true; $('student').hidden = true; $('reconnect').hidden = true; $('conflict').hidden = true; $('parts').replaceChildren(); $('teams').replaceChildren(); $('roster').replaceChildren(); $('result').replaceChildren();
    $('login').textContent = user ? 'Account' : 'Sign in'; $('status').textContent = user ? 'Checking access…' : 'Sign in with your course account.';
    load().catch(e => report(e));
  }
  window.addEventListener('jaralingua:auth-changed', authChanged);
  window.addEventListener('beforeunload', e => { backup(); if (dirty || pending) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { backup(); save().catch(() => {}); } });
  setInterval(clock, 1000);
  setInterval(async () => {
    if (!user?.credential || isStaff() || loading || recovery || busy || saving || conflict || dirty) return;
    try { const fresh = await request('state'); if (loading || dirty || busy || saving || conflict || recovery) return; const same = fresh.team?.id === team?.id; state = fresh; team = fresh.team || null; studentView(!same); }
    catch (e) { if (e.status === 401) report(e); }
  }, 8000);
  authChanged();
})();
