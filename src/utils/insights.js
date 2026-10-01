export function postGameInsights(reward = {}, lang = 'id') {
  const en=lang==='en';
  const out=[];
  const score=Number(reward.performance)||0;
  const duration=Number(reward.durationMs)||0;
  const previous=Number(reward.previousBestMs)||0;
  const hints=Number(reward.hintsUsed)||0;
  const delta=Number(reward.rankedDelta)||0;

  if (reward.isPersonalBest && duration) {
    if (previous>duration) {
      const gain=Math.max(1,Math.round(((previous-duration)/previous)*100));
      out.push({tone:'good',icon:'ghost',title:en?'New personal best':'Personal best baru',text:en?`You improved your previous time by about ${gain}%.`:`Kamu sekitar ${gain}% lebih cepat dari rekor sebelumnya.`});
    } else out.push({tone:'good',icon:'ghost',title:en?'First benchmark saved':'Benchmark pertama tersimpan',text:en?'This run is now your reference time for this difficulty.':'Run ini menjadi waktu acuan untuk tingkat kesulitan ini.'});
  } else if (previous && duration) {
    const diff=duration-previous;
    const pct=Math.max(1,Math.round((Math.abs(diff)/previous)*100));
    out.push({tone:diff<=0?'good':'neutral',icon:'clock',title:en?'Compared with your PB':'Dibandingkan PB',text:diff<=0?(en?`You matched or beat your best pace by ${pct}%.`:`Pace-mu menyamai atau melampaui PB sekitar ${pct}%.`):(en?`You were about ${pct}% slower than your best run. Focus on cleaner decisions.`:`Kamu sekitar ${pct}% lebih lambat dari run terbaik. Fokus pada keputusan yang lebih bersih.`)});
  }

  if (score>=96) out.push({tone:'good',icon:'trophy',title:en?'Elite performance':'Performa elite',text:en?'Your speed and consistency were strong enough for an S-grade run.':'Kecepatan dan konsistensimu sudah berada di level grade S.'});
  else if (score<78) out.push({tone:'warn',icon:'brain',title:en?'Room to improve':'Masih ada ruang berkembang',text:en?'Slow down slightly and prioritize accuracy before chasing speed.':'Kurangi tempo sedikit dan utamakan akurasi sebelum mengejar kecepatan.'});

  if (hints>=2) out.push({tone:'neutral',icon:'brain',title:en?'Coach reliance':'Pemakaian Brain Coach',text:en?'You used multiple hints. Replay the challenge once without help to lock in the pattern.':'Kamu memakai beberapa hint. Coba ulangi challenge tanpa bantuan untuk menguatkan pola berpikir.'});
  else if (hints===0 && score>=88) out.push({tone:'good',icon:'brain',title:en?'Independent clear':'Selesai mandiri',text:en?'You completed this run without Brain Coach while keeping a strong grade.':'Kamu menyelesaikan run tanpa Brain Coach dengan grade yang kuat.'});

  if (reward.mode==='ranked') {
    out.push({tone:delta>=0?'good':'warn',icon:'shield',title:en?'Ranked impact':'Dampak Ranked',text:delta>=0?(en?`This result added ${delta} Arena RP.`:`Hasil ini menambah ${delta} Arena RP.`):(en?`This result changed your Arena RP by ${delta}. Review the replay before your next Ranked run.`:`Hasil ini mengubah Arena RP sebesar ${delta}. Tinjau replay sebelum Ranked berikutnya.`)});
  }
  return out.slice(0,3);
}
