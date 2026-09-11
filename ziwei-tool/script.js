/* ===========================================================
   玄曜 · 紫微斗數命盤 排盤引擎 + 渲染
   依據：常用通行版安紫微表（V3 引擎）
   =========================================================== */
(function(){
"use strict";

/* ---------- 基礎 ---------- */
const GAN='甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
const gIdx=g=>GAN.indexOf(g), zIdx=z=>ZHI.indexOf(z);
const n10=n=>((n%10)+10)%10, n12=n=>((n%12)+12)%12;

/* 1. 五虎遁 */
const WUHU={甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'};

/* 2. 十二宮宮干 */
function palaceGanZhi(yearGan){
  const g0=gIdx(WUHU[yearGan]);
  const out={};
  for(let i=0;i<12;i++){
    const z=n12(2+i), g=n10(g0+i);
    out[ZHI[z]]=GAN[g]+ZHI[z];
  }
  return out;
}

/* 3. 命宮/身宮 */
function mingShenGong(month, zhiHourIdx){
  const monthPal=n12(2+(month-1));
  const ming=n12(monthPal - zhiHourIdx);
  const shen=n12(monthPal + zhiHourIdx);
  return {mingZhi:ZHI[ming], shenZhi:ZHI[shen]};
}

/* 4. 五行局（納音） */
const NA_YIN={
  '甲子':'海中金','乙丑':'海中金','丙寅':'爐中火','丁卯':'爐中火','戊辰':'大林木','己巳':'大林木',
  '庚午':'路旁土','辛未':'路旁土','壬申':'劍鋒金','癸酉':'劍鋒金','甲戌':'山頭火','乙亥':'山頭火',
  '丙子':'澗下水','丁丑':'澗下水','戊寅':'城頭土','己卯':'城頭土','庚辰':'白蠟金','辛巳':'白蠟金',
  '壬午':'楊柳木','癸未':'楊柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹靂火','己丑':'霹靂火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'長流水','癸巳':'長流水',
  '甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆燈火','乙巳':'覆燈火',
  '丙午':'天河水','丁未':'天河水','戊申':'大驛土','己酉':'大驛土','庚戌':'釵釧金','辛亥':'釵釧金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土',
  '戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'
};
const NA_YIN_TO_JU={'海中金':'金','劍鋒金':'金','白蠟金':'金','沙中金':'金','金箔金':'金','釵釧金':'金',
  '爐中火':'火','山頭火':'火','霹靂火':'火','山下火':'火','覆燈火':'火','天上火':'火',
  '大林木':'木','楊柳木':'木','松柏木':'木','平地木':'木','桑柘木':'木','石榴木':'木',
  '路旁土':'土','城頭土':'土','屋上土':'土','壁上土':'土','大驛土':'土','沙中土':'土',
  '澗下水':'水','泉中水':'水','長流水':'水','天河水':'水','大溪水':'水','大海水':'水'};
function wuxingJu(mingGanZhi){
  const ny=NA_YIN[mingGanZhi]||'';
  const j=NA_YIN_TO_JU[ny];
  const name=(j?j:(ny?'':''))+'';
  const num=({水:2,木:3,金:4,土:5,火:6}[j])||0;
  return {naYin:ny, ju:j, juName:name+num+'局', juNum:num};
}

/* 5. 安紫微：常用通行版查表 */
const ANZIWEI = {
  '水二':['丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子','子','丑','丑','寅','寅','卯','卯','辰'],
  '木三':['辰','丑','寅','巳','寅','卯','午','卯','辰','未','辰','巳','申','巳','午','酉','午','未','戌','未','申','亥','申','酉','子','酉','戌','丑','戌','亥'],
  '金四':['亥','辰','丑','寅','子','巳','寅','卯','丑','午','卯','辰','寅','未','辰','巳','卯','申','午','未','巳','戌','午','未','午','亥','未','申','午','亥'],
  '土五':['午','亥','辰','丑','寅','未','子','巳','寅','卯','申','丑','午','卯','辰','酉','寅','未','辰','巳','戌','卯','申','巳','午','亥','辰','酉','午','未'],
  '火六':['酉','午','亥','辰','丑','寅','戌','未','子','巳','寅','卯','亥','申','丑','午','卯','辰','子','酉','寅','未','辰','巳','丑','戌','卯','申','巳','午']
};
function ziweiZhi(ju, day){ return ANZIWEI[ju][day-1]; }

/* 6. 天府定位 */
const ZIWEI_TO_TIANFU={子:'辰',丑:'卯',寅:'寅',卯:'丑',辰:'子',巳:'亥',午:'戌',未:'酉',申:'申',酉:'未',戌:'午',亥:'巳'};
function tianfuZhi(zz){ return ZIWEI_TO_TIANFU[zz]; }

/* 7. 十四主星 */
const ZIWEI_XI={紫微:0,天機:-1,太陽:-3,武曲:-4,天同:-5,廉貞:-8};
const TIANFU_XI={天府:0,太陰:1,貪狼:2,巨門:3,天相:4,天梁:5,七殺:6,破軍:10};
function placeStars(zz, tf){
  const res={};
  const put=(z,s)=>{ (res[z]=res[z]||[]).push(s); };
  Object.entries(ZIWEI_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(zz)+off)],s));
  Object.entries(TIANFU_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(tf)+off)],s));
  return res;
}

/* 8. 四化 */
const SIHUA={
  甲:{祿:'廉貞',權:'破軍',科:'武曲',忌:'太陽'},
  乙:{祿:'天機',權:'天梁',科:'紫微',忌:'太陰'},
  丙:{祿:'天同',權:'天機',科:'文昌',忌:'廉貞'},
  丁:{祿:'太陰',權:'天同',科:'天機',忌:'巨門'},
  戊:{祿:'貪狼',權:'太陰',科:'右弼',忌:'天機'},
  己:{祿:'武曲',權:'貪狼',科:'天梁',忌:'文曲'},
  庚:{祿:'太陽',權:'武曲',科:'太陰',忌:'天同'},
  辛:{祿:'巨門',權:'太陽',科:'文曲',忌:'文昌'},
  壬:{祿:'天梁',權:'紫微',科:'左輔',忌:'武曲'},
  癸:{祿:'破軍',權:'巨門',科:'太陰',忌:'貪狼'}
};



/* 9. 十二宮名稱（命宮起，逆時針） */
const PALACE_NAMES=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];

/* 10. 六吉六煞安星（浩哥提供口訣） */
const KUI={甲:'丑',乙:'子',丙:'亥',丁:'亥',戊:'丑',己:'子',庚:'丑',辛:'午',壬:'卯',癸:'卯'};
const YUE={甲:'未',乙:'申',丙:'酉',丁:'酉',戊:'未',己:'申',庚:'未',辛:'寅',壬:'巳',癸:'巳'};
const LUCUN={甲:'寅',乙:'卯',丙:'巳',戊:'巳',丁:'午',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const HUOLING={'寅午戌':['丑','卯'],'申子辰':['寅','戌'],'巳酉丑':['卯','戌'],'亥卯未':['酉','戌']};
function sanhe(z){ if(['寅','午','戌'].includes(z))return '寅午戌'; if(['申','子','辰'].includes(z))return '申子辰'; if(['巳','酉','丑'].includes(z))return '巳酉丑'; return '亥卯未'; }
function placeAux(yearGan, yearZhi, month, hour){
  const aux={}; // 地支->[星]
  const put=(z,s)=>{ if(z){ (aux[z]=aux[z]||[]).push(s); } };
  // 六吉
  put(ZHI[n12(4+(month-1))],'左輔');      // 左輔辰順月
  put(ZHI[n12(10-(month-1))],'右弼');     // 右弼戌逆月
  put(ZHI[n12(10-hour)],'文昌');          // 文昌戌逆時
  put(ZHI[n12(4+hour)],'文曲');           // 文曲辰順時
  put(KUI[yearGan],'天魁');
  put(YUE[yearGan],'天鉞');
  // 祿存 + 擎羊陀羅
  const lu=LUCUN[yearGan];
  put(lu,'祿存');
  put(ZHI[n12(zIdx(lu)+1)],'擎羊');
  put(ZHI[n12(zIdx(lu)-1)],'陀羅');
  // 火鈴（年支三合）
  const sh=sanhe(yearZhi);
  put(ZHI[n12(zIdx(HUOLING[sh][0])+hour)],'火星');
  put(ZHI[n12(zIdx(HUOLING[sh][1])+hour)],'鈴星');
  // 空劫
  put(ZHI[n12(11+hour)],'地劫');          // 地劫亥順時
  put(ZHI[n12(11-hour)],'地空');           // 地空亥逆時
  return aux;
}

/* 11. 大限（浩哥規則） */
const YANG_GAN=['甲','丙','戊','庚','壬'];
const JU_START={水二:2,木三:3,金四:4,土五:5,火六:6};
const SHUN_NAME=['命宮','父母','福德','田宅','官祿','交友','遷移','疾厄','財帛','子女','夫妻','兄弟'];
const NI_NAME=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];
function calcDaxian(yearGan, gender, mingZhi, ju){
  const isYang=YANG_GAN.includes(yearGan);
  const isMale=gender==='男';
  const shun=(isMale&&isYang)||(!isMale&&!isYang); // 陽男陰女順行
  const start=JU_START[ju]||0;
  const mingIdx=zIdx(mingZhi);
  const names=shun?SHUN_NAME:NI_NAME;
  const res=[];
  for(let i=0;i<12;i++){
    const zhi = shun ? ZHI[n12(mingIdx-i)] : ZHI[n12(mingIdx+i)];
    res.push({name:names[i], zhi, startAge:start+i*10});
  }
  return {shun, start, res};
}

/* 12. 流年太歲 + 小限（浩哥規則） */
function calcLiunian(lyGan, lyZhi, mingZhi, gender, age){
  // 流年太歲：以流年支定位命盤對應宮（地支即宮位）
  const lyPalace = lyZhi; // 流年太歲落宮 = 流年支地支
  // 該流年宮是命盤哪一宮（從命宮逆時針數到該地支）
  const mingIdx=zIdx(mingZhi), lyIdx=zIdx(lyZhi);
  const offset=n12(mingIdx-lyIdx); // 命宮到流年宮逆時針步數
  const lyName=PALACE_NAMES[offset];
  // 流年干四化
  const lySihua=SIHUA[lyGan];
  // 小限：男順女逆，1歲起命宮
  const xIdx=(age-1)%12;
  const xNameArr = gender==='男'?SHUN_NAME:NI_NAME;
  const xZhiRaw = gender==='男'? ZHI[n12(mingIdx-xIdx)] : ZHI[n12(mingIdx+xIdx)];
  const xName=xNameArr[xIdx];
  return {lyPalace, lyName, lySihua, xZhi:xZhiRaw, xName, xIndex:xIdx};
}

/* ---------- 渲染 ---------- */
function render(){
  const yearGan=document.getElementById('yearGan').value;
  const month=parseInt(document.getElementById('month').value,10);
  const hour=parseInt(document.getElementById('hour').value,10);
  const day=parseInt(document.getElementById('day').value,10);
  const ju=document.getElementById('ju').value;
  const yearZhi=document.getElementById('yearZhi').value;
  const gender=document.getElementById('gender').value;
  if(!day||day<1||day>30){ alert('請輸入農曆生日 1-30'); return; }

  // 計算
  const gzMap=palaceGanZhi(yearGan);
  const ms=mingShenGong(month, hour);
  const zz=ziweiZhi(ju, day);
  const tf=tianfuZhi(zz);
  const stars=placeStars(zz, tf);
  const aux=placeAux(yearGan, yearZhi, month, hour);
  const sihua=SIHUA[yearGan];
  // 命宮干支 + 五行局
  const mingGZ=gzMap[ms.mingZhi];
  const wj=wuxingJu(mingGZ);

  // 顯示面板
  document.getElementById('chartPanel').style.display='';
  document.getElementById('infoPanel').style.display='';
  document.getElementById('daxianPanel').style.display='';
  const tianLabel='紫微在'+zz;
  document.getElementById('tianLabel').textContent=tianLabel;
  document.getElementById('ziweiLabel').textContent='紫微 '+zz;
  document.getElementById('centerGanZhi').textContent=mingGZ;

  // 大限
  const dx=calcDaxian(yearGan, gender, ms.mingZhi, ju);
  const dxDesc=(dx.shun?'陽男/陰女順行':'陰男/陽女逆行')+' · '+wj.juName+'起運 '+dx.start+'歲';
  document.getElementById('daxianDesc').textContent=dxDesc;
  document.getElementById('daxianList').innerHTML=dx.res.map(l=>
    `<div class="dx-item"><span class="dx-age">${l.startAge}歲</span><span class="dx-name">${l.name} · ${l.zhi}</span><span class="dx-range">${l.startAge}-${l.startAge+9}歲</span></div>`
  ).join('');

  // 流年太歲 + 小限 + 十二神煞
  document.getElementById('liunianPanel').style.display='';
  const lyGan=document.getElementById('lyGan').value;
  const lyZhi=document.getElementById('lyZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const ln=calcLiunian(lyGan, lyZhi, ms.mingZhi, gender, age);
  const lySihuaStr='祿'+ln.lySihua.祿+' 權'+ln.lySihua.權+' 科'+ln.lySihua.科+' 忌'+ln.lySihua.忌;
  document.getElementById('liunianResult').innerHTML=
    `<div class="ln-item"><span class="ln-label">流年太歲</span><span class="ln-val">${lyGan}${lyZhi}年 · ${ln.lyName}（${lyZhi}宮）</span></div>`+
    `<div class="ln-item"><span class="ln-label">流年四化</span><span class="ln-val">${lySihuaStr}</span></div>`+
    `<div class="ln-item"><span class="ln-label">小限</span><span class="ln-val">${age}歲 → ${ln.xName}（${ln.xZhi}宮）</span></div>`;
  // 記錄高亮宮位（供渲染用）
  window.__hlLy=lyZhi;
  window.__hlX=ln.xZhi;
  // 流年四化標記：星->字（供盤上標注，金色）
  const lySihuaMark={};
  Object.entries(ln.lySihua).forEach(([k,star])=>lySihuaMark[star]=k);
  window.__lySihuaMark=lySihuaMark;
  // 十二神煞
  const SHENSHA=['歲建','晦氣','喪門','貫索','官符','小耗','大耗','龍德','白虎','天德','弔客','病符'];
  const ssStart=zIdx(lyZhi);
  document.getElementById('shenshaGrid').innerHTML=SHENSHA.map((s,i)=>{
    const z=ZHI[n12(ssStart+i)];
    const isLy = z===lyZhi;
    return `<div class="ss-item${isLy?' ss-ly':''}"><span class="ss-name">${s}</span><span class="ss-zhi">${z}宮</span></div>`;
  }).join('');

  // 四化標記：找出四化星落宮（祿/權/科/忌 標在星旁）
  const sihuaMark={}; // 星->字
  Object.entries(sihua).forEach(([k,star])=>sihuaMark[star]=k);

  // 構建 12 宮（順序 = 逆時針，從命宮起）
  const mingIdx=zIdx(ms.mingZhi);
  const order=[]; // [{name, zhi, gz, stars:[], aux:[]}]
  for(let i=0;i<12;i++){
    const zhi=ZHI[n12(mingIdx-i)]; // 逆時針
    order.push({
      name:PALACE_NAMES[i],
      zhi,
      gz:gzMap[zhi],
      stars:stars[zhi]||[],
      aux:aux[zhi]||[],
      isMing: i===0,
      isShen: zhi===ms.shenZhi
    });
  }

  // 流年重點宮位提示（浩哥方案3）
  (function(){
    const lyPalace=order.find(o=>o.zhi===lyZhi);
    if(!lyPalace) return;
    const parts=[];
    lyPalace.stars.forEach(s=>{
      let t=s;
      if(window.__lySihuaMark && window.__lySihuaMark[s]) t+='（流'+window.__lySihuaMark[s]+'）';
      if(sihuaMark[s]) t+='（'+sihuaMark[s]+'）';
      parts.push(t);
    });
    lyPalace.aux.forEach(s=>{
      let t=s;
      if(window.__lySihuaMark && window.__lySihuaMark[s]) t+='（流'+window.__lySihuaMark[s]+'）';
      parts.push(t);
    });
    const starStr=parts.length?parts.join('、'):'（無主星）';
    const el=document.createElement('div');
    el.className='ln-item ln-focus';
    el.innerHTML=`<span class="ln-label">流年重點</span><span class="ln-val">${lyGan}${lyZhi}年命主看<em>${lyPalace.name}（${lyPalace.zhi}宮）</em>：${starStr}</span>`;
    document.getElementById('liunianResult').appendChild(el);
  })();

  // 網格渲染（標準紫微盤方位）
  const gridMap={}; // idx -> [gridRow, gridCol]
  const P=[
    [3,0],[3,1],[3,2],[3,3],
    [2,3],[1,3],[0,3],[0,2],
    [0,1],[0,0],[1,0],[2,0]
  ];
  const chart=document.getElementById('chart');
  chart.innerHTML='';
  // 先建空 4x4
  const cells=Array(4).fill().map(()=>Array(4).fill(null));
  order.forEach((o,i)=>{ cells[P[i][0]][P[i][1]]={o,i}; });

  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      const cell=cells[r][c];
      if(!cell){ continue; } // 中間十字留空
      const o=cell.o;
      const div=document.createElement('div');
      let cls='palace'+(o.isMing?' ming':'')+(o.isShen?' shen':'');
      if(window.__hlLy===o.zhi) cls+=' ly';
      if(window.__hlX===o.zhi) cls+=' xx';
      div.className=cls;
      // 標記命/身
      let name=o.name;
      if(o.isMing) name+='·命';
      if(o.isShen) name+='·身';
      if(window.__hlLy===o.zhi) name+='·流';
      if(window.__hlX===o.zhi) name+='·限';
      // 宮干加支
      const gzNow=o.gz;
      // 星（主星 + 四化標記）
      let starsHtml='';
      o.stars.forEach(s=>{
        let cls='star';
        if(ZIWEI_XI[s]!==undefined) cls+=' ziwei';
        if(TIANFU_XI[s]!==undefined) cls+=' tianfu';
        let label=s;
        if(sihuaMark[s]){ cls+=' sihua'; label+=''+sihuaMark[s]; }
        if(window.__lySihuaMark && window.__lySihuaMark[s]){ cls+=' ly-sihua'; label+='流'+window.__lySihuaMark[s]; }
        starsHtml+=`<span class="${cls}">${label}</span>`;
      });
      // 輔星（六吉六煞）
      o.aux.forEach(s=>{
        let cls='star aux';
        if(['擎羊','陀羅','火星','鈴星','地空','地劫'].includes(s)) cls+=' sha';
        let label=s;
        if(sihuaMark[s]){ cls+=' sihua'; label+=''+sihuaMark[s]; }
        if(window.__lySihuaMark && window.__lySihuaMark[s]){ cls+=' ly-sihua'; label+='流'+window.__lySihuaMark[s]; }
        starsHtml+=`<span class="${cls}">${label}</span>`;
      });
      div.innerHTML=`
        <div class="pal-top">
          <span class="pal-name">${name}</span>
          <span class="pal-gz">${gzNow}</span>
        </div>
        <div class="pal-stars">${starsHtml}</div>
      `;
      chart.appendChild(div);
    }
  }

  // 資訊面板
  const info=document.getElementById('infoGrid');
  const infoData=[
    ['命宮', mingGZ+' 落'+ms.mingZhi+'宮'],
    ['身宮', gzMap[ms.shenZhi]+' 落'+ms.shenZhi+'宮'],
    ['五行局', (wj.naYin||'')+' · '+(wj.juName||'未定')],
    ['紫微', zz+'宮'],
    ['天府', tf+'宮'],
    ['四化('+yearGan+'干)', '祿'+sihua.祿+' 權'+sihua.權+' 科'+sihua.科+' 忌'+sihua.忌]
  ];
  info.innerHTML=infoData.map(d=>`<div class="info-item"><div class="k">${d[0]}</div><div class="v">${d[1]}</div></div>`).join('');
}

document.getElementById('calcBtn').addEventListener('click', render);
// 初始排一張
window.addEventListener('DOMContentLoaded', render);

})();
