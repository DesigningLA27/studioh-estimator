// Shared connection for supplied design-engine context. Does not edit plan geometry.
export function createDesignAI({endpoint,adminKey,fetchImpl=globalThis.fetch}){
  if(!endpoint || !adminKey) throw new Error('Worker endpoint and administrator session are required.');
  async function send(body){
    const response=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,key:adminKey})});
    const data=await response.json();
    if(!response.ok || data.error)throw new Error(typeof data.error==='string'?data.error: 'AI request failed');
    return data;
  }
  return {
    review({question,questionnaire,site,rules,evidence=[],locks=[]}){
      if(!question || !questionnaire || !site || !rules)throw new Error('Supply a question, questionnaire, site geometry and design rules.');
      return send({type:'designreason',instructions:'Review this supplied design context. Cite evidence IDs for library-derived recommendations. Identify geometry conflicts and missing measurements. Separate hard rules from preferences. Return a proposal for review; do not claim to have changed the plan.',input:JSON.stringify({question,questionnaire,site,rules,evidence,locks})});
    },
    render({prompt,refs=[],aspect='3:2'}){
      return send({type:'genimage',model:'gpt-image-2.5-sunburst',quality:'max',prompt,refs,aspect});
    }
  };
}
