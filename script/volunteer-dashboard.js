(function(){
  const BASE=(typeof API_CONFIG!=='undefined'?API_CONFIG.BASE_URL:'https://secondserve-m33f.onrender.com/api');
  const TOKEN_KEY=(typeof API_CONFIG!=='undefined'?API_CONFIG.TOKEN_KEY:'feedlink_auth_token');
  const token=()=>sessionStorage.getItem(TOKEN_KEY)||localStorage.getItem(TOKEN_KEY);
  async function api(path, options={}){
    const headers={'Accept':'application/json','Content-Type':'application/json'}; if(token()) headers.Authorization='Bearer '+token();
    const response=await fetch(BASE+path,{...options,headers});
    if(response.status===401){location.href='login.html';throw new Error('Your session has expired. Please log in again.');}
    if(!response.ok){const text=await response.text();let message=text;try{message=JSON.parse(text).error||text;}catch(_){ }throw new Error(message||response.statusText);}
    return response.json();
  }
  const esc=value=>String(value??'').replace(/[&<>"']/g,match=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[match]));
  const maps=(from,to)=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from||'')+'&destination='+encodeURIComponent(to||'')+'&travelmode=driving';
  const formatDate=value=>value?new Date(value).toLocaleString():'Not set';
  function statusActions(task){
    if(task.status==='assigned') return '<button class="btn" data-status="accepted"><i class="fas fa-check"></i> Accept task</button>';
    if(task.status==='accepted') return '<button class="btn" data-status="received"><i class="fas fa-box-open"></i> Mark received</button>';
    if(task.status==='received') return '<button class="btn" data-status="delivered"><i class="fas fa-check-double"></i> Mark delivered</button>';
    return '';
  }
  function feedback(task){
    if(task.status!=='delivered'||task.volunteer_rating) return task.volunteer_rating?'<div class="notice"><i class="fas fa-heart"></i> Feedback submitted. Thank you.</div>':'';
    return '<form class="feedback" data-feedback="'+esc(task.id)+'"><label>Your experience</label><div class="rating">'+[5,4,3,2,1].map(value=>'<input id="rating-'+task.id+'-'+value+'" type="radio" name="rating" value="'+value+'"><label for="rating-'+task.id+'-'+value+'" title="'+value+' stars">★</label>').join('')+'</div><textarea name="feedback" placeholder="Share a note about the pickup and delivery"></textarea><input name="videoUrl" type="url" placeholder="Optional video note link (https://...)"><button class="btn" type="submit">Send feedback</button></form>';
  }
  function render(tasks){
    const list=document.getElementById('taskList');
    document.getElementById('activeCount').textContent=tasks.filter(task=>!['delivered','cancelled'].includes(task.status)).length;
    document.getElementById('deliveredCount').textContent=tasks.filter(task=>task.status==='delivered').length;
    document.getElementById('receivedCount').textContent=tasks.filter(task=>task.status==='received').length;
    if(!tasks.length){list.innerHTML='<div class="empty"><i class="fas fa-route"></i><p>No assignments yet. Your next route will appear here.</p></div>';return;}
    list.innerHTML=tasks.map(task=>{const request=task.pickup_requests||{};const donation=request.donations||{};const pickup=task.pickup_address||'Pickup location not provided';const delivery=task.delivery_address||'Delivery location not provided';return '<article class="task" data-assignment="'+esc(task.id)+'"><div class="task-top"><div><h3>'+esc(donation.title||'Food donation')+'</h3><span class="sub">Assigned '+esc(formatDate(task.assigned_at))+'</span></div><span class="status">'+esc(task.status)+'</span></div><div class="task-meta"><div><i class="fas fa-location-dot"></i><strong>Pickup:</strong> '+esc(pickup)+'</div><div><i class="fas fa-house-circle-check"></i><strong>Deliver to:</strong> '+esc(delivery)+'</div><div><i class="fas fa-box"></i><strong>Donation:</strong> '+esc(donation.quantity||donation.description||'Food parcel')+'</div></div>'+(task.assignment_message?'<div class="task-message"><i class="fas fa-message"></i> '+esc(task.assignment_message)+'</div>':'')+'<div class="actions"><a class="btn secondary" href="'+maps(pickup,delivery)+'" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> Open route</a>'+statusActions(task)+'</div>'+feedback(task)+'</article>';}).join('');
  }
  async function load(){
    const sync=document.getElementById('syncText');sync.textContent='Refreshing tasks...';
    try{const payload=await api('/volunteers/dashboard/tasks');document.getElementById('volunteerName').textContent=payload.volunteer.full_name||'Volunteer';const approval=String(payload.volunteer.status||'approved').toLowerCase()==='approved'?'Approved delivery partner':'Profile pending admin approval';document.getElementById('volunteerMeta').textContent=[payload.volunteer.city,payload.volunteer.role].filter(Boolean).join(' · ')||approval;render(payload.tasks||[]);sync.textContent=approval==='Approved delivery partner'?'Updated just now':'Your profile is pending approval. Assignments will appear once approved.';}
    catch(error){document.getElementById('taskList').innerHTML='<div class="error"><i class="fas fa-triangle-exclamation"></i> '+esc(error.message)+'</div>';sync.textContent='Could not connect';}
  }
  document.getElementById('refreshBtn').addEventListener('click',load);
  document.getElementById('taskList').addEventListener('click',async event=>{const button=event.target.closest('[data-status]');if(!button)return;const task=button.closest('.task');const assignmentId=task.dataset.assignment;if(!assignmentId)return;button.disabled=true;try{await api('/volunteers/dashboard/tasks/'+encodeURIComponent(assignmentId)+'/status',{method:'PUT',body:JSON.stringify({status:button.dataset.status})});await load();}catch(error){alert(error.message);button.disabled=false;}});
  document.getElementById('taskList').addEventListener('submit',async event=>{const form=event.target.closest('[data-feedback]');if(!form)return;event.preventDefault();const rating=form.querySelector('[name="rating"]:checked')?.value;if(!rating){alert('Choose a rating first.');return;}const button=form.querySelector('button');button.disabled=true;try{await api('/volunteers/dashboard/tasks/'+encodeURIComponent(form.dataset.feedback)+'/feedback',{method:'POST',body:JSON.stringify({rating,feedback:form.feedback.value,videoUrl:form.videoUrl.value})});await load();}catch(error){alert(error.message);button.disabled=false;}});
  load();
})();
