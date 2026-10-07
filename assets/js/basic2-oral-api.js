(() => {
  'use strict';
  const messages={
    account_not_linked:'This account is not linked to Basic English 2. Use your registered course account.',
    not_registered_for_exam:'This account is not registered for this oral exam.',
    student_already_paired:'One of these students already has a partner. Refresh the class list.',
    registration_closed:'New pair registration is closed.',
    wrong_pair:'You do not have access to this pair.',pair_cancelled:'This pair has been cancelled. Refresh access.',
    plan_changed:'Your partner saved a newer plan. Review the saved version before replacing it.',
    review_changed:'This rubric changed in another tab. Reload the saved rubric before continuing.',
    teacher_must_change_pair:'Your teacher has started the assessment. Ask the teacher before changing partners.',
    graded_pair_locked:'Assessment has started. This pair cannot be cancelled.',
    exam_graded:'This presentation has already been graded. Its plan and materials are locked.',
    unsupported_file:'Choose a JPG, PNG, WebP, PDF or PowerPoint (.pptx) file.',
    file_too_large:'Each file can be up to 15 MB.',too_many_pages:'Use a presentation with 1–30 pages or slides.',
    pair_storage_limit:'A pair can keep up to 6 files and 40 MB of original files. Remove an unused file first.',
    external_powerpoint_links:'This PowerPoint contains external links. Export it as a PDF, or remove linked content before uploading.',
    unsupported_embedded_content:'This PowerPoint contains embedded objects or macros. Export it as a PDF before uploading.',
    invalid_image:'This image cannot be opened. Export it as JPG or PNG and try again.',
    invalid_pdf:'This is not a readable PDF.',invalid_powerpoint:'This is not a supported PowerPoint presentation.',
    conversion_timeout:'Conversion took too long. Export a smaller PDF and try again.',
    conversion_failed:'The file could not be prepared for projection. Try an unprotected PDF or a JPG image.',
    converter_unavailable:'The file converter is temporarily unavailable. Please try again later.',
    converter_busy:'Other files are being converted. Please try again in a moment.',
    complete_rubric:'Select a score for all five criteria before publishing.',
    invalid_rubric:'Each criterion needs a whole number from 1 to 10.',
    exam_temporarily_unavailable:'The exam service is temporarily unavailable. Please retry.',
    configuration_pending:'The teacher is completing the exam settings.',weight_pending:'The course percentage must be configured before publishing grades.',
    invalid_partner:'Choose an available classmate.',invalid_file:'The file could not be read. Please select it again.',
    request_reused:'This operation changed while it was being sent. Refresh and retry.',
    invalid_text:'Check the text length and required fields.',confirm_pair_first:'Your pair must be registered before continuing.'
  };
  class OralClient {
    constructor(){this.user=null;this.epoch=0;this.controllers=new Set();}
    setUser(user){this.epoch++;this.controllers.forEach(c=>c.abort());this.controllers.clear();this.user=user;}
    async request(route,payload){
      if(!this.user?.credential)throw Object.assign(new Error('Sign in with your course account.'),{status:401});
      const epoch=this.epoch,controller=new AbortController();this.controllers.add(controller);
      const timer=setTimeout(()=>controller.abort(),route==='upload'?120000:25000);
      try {
        const response=await fetch('/api/basic2/final-oral/'+route,{method:payload===undefined?'GET':'POST',cache:'no-store',signal:controller.signal,
          headers:{Authorization:'Bearer '+this.user.credential,'X-Jaralingua-Auth-Provider':this.user.provider||'google',...(payload===undefined?{}:{'Content-Type':'application/json'})},
          ...(payload===undefined?{}:{body:JSON.stringify(payload)})});
        if(epoch!==this.epoch)throw Object.assign(new Error('Account changed'),{code:'account_changed'});
        if(!response.ok){let data={};try{data=await response.json();}catch{}throw Object.assign(new Error(data.error||'Request failed'),{code:data.error,status:response.status});}
        const data=route.startsWith('file/')?await response.blob():await response.json();
        if(epoch!==this.epoch)throw Object.assign(new Error('Account changed'),{code:'account_changed'});
        return data;
      } catch(e) {
        if(epoch!==this.epoch)throw Object.assign(new Error('Account changed'),{code:'account_changed'});
        throw e;
      } finally {clearTimeout(timer);this.controllers.delete(controller);}
    }
  }
  function errorText(e){return e.code==='account_changed'?'':e.status===401?'Your session expired. Reconnect with the same course account, then retry.':e.name==='AbortError'?'The request timed out. Refresh to check what was saved, then retry.':messages[e.code]||e.message||'Connection failed. Please retry.';}
  window.Basic2OralAPI={OralClient,errorText,requestId:()=>crypto.randomUUID()};
})();
