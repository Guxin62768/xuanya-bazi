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

/* 13. 命宮主星斷語（通用中性，文化參考） */
const STAR_DESC={
  '紫微':'帝座之星，主貴氣與領導力，格局高者具統御之才',
  '天機':'智慧之星，主思辨與機變，善謀略而多動',
  '太陽':'光明之星，主名聲與付出，熱忱坦蕩',
  '武曲':'財星，主剛毅與執行，行事果斷務實',
  '天同':'福星，主安逸與隨和，性溫厚知足',
  '廉貞':'次桃花星，主才藝與權變，性烈而有主見',
  '天府':'庫星，主穩重與積蓄，善守成而寬厚',
  '太陰':'田宅主，主內斂與細膩，性溫柔善感',
  '貪狼':'桃花星，主才藝與慾望，交際廣而多變',
  '巨門':'暗星，主口才與是非，善言辭而多思',
  '天相':'印星，主輔佐與協調，性溫和守規',
  '天梁':'蔭星，主清高與庇護，性正直而老成',
  '七殺':'將星，主威嚴與開創，性剛烈而果決',
  '破軍':'耗星，主變動與開拓，性衝動而敢為'
};

/* 14. 十二宮主題（流年宮位斷語用） */
const PALACE_THEME={
  '命宮':'一生格局與性格之樞紐',
  '兄弟':'手足緣分與平輩助力',
  '夫妻':'婚姻感情與配偶關係',
  '子女':'子嗣緣分與晚輩',
  '財帛':'財祿進出與理財方式',
  '疾厄':'健康體質與潛在隱憂',
  '遷移':'外出際遇與環境變動',
  '交友':'人際往來與合作夥伴',
  '官祿':'事業發展與社會地位',
  '田宅':'房產積蓄與家庭根基',
  '福德':'精神享受與福分根基',
  '父母':'長上緣分與早年環境'
};
const STAR_KEY={
  '紫微':'主貴', '天機':'主智', '太陽':'主名', '武曲':'主財', '天同':'主福',
  '廉貞':'主權變', '天府':'主守成', '太陰':'主田宅', '貪狼':'主才藝', '巨門':'主口舌',
  '天相':'主協調', '天梁':'主庇蔭', '七殺':'主開創', '破軍':'主變動'
};
const SI_HUA_DESC={
  '祿':'當年生旺、緣分增進，易得助力或順遂',
  '權':'當年主導性增強，利於掌權、擔責、推進',
  '科':'當年名聲彰顯，利於文名、聲望、貴人提攜',
  '忌':'當年需多留意，防其對應領域的困擾或執著'
};
const SS_DESC={
  '歲建':'本命太歲，主當年根基與整體氣運，宜穩重行事',
  '晦氣':'主情緒低落、易有悶氣，宜多開解、少計較',
  '喪門':'主家中長輩或親友之事，宜多關心、防意外',
  '貫索':'主牽絆、糾纏，宜謹言慎行、防口舌是非',
  '官符':'主官司、文書、是非，宜守法守規、防訴訟',
  '小耗':'主小破財、小耗損，宜節制開支、防遺失',
  '大耗':'主較大破耗、損財，宜謹慎理財、防大額支出',
  '龍德':'主貴人、吉祥，逢之多得助力、諸事順遂',
  '白虎':'主血光、爭鬥、壓力，宜防意外、保平安',
  '天德':'主天賜福澤、化解凶厄，逢之多有庇佑',
  '弔客':'主弔喪、探病之事，宜注意健康、少涉喪事',
  '病符':'主小病、體弱，宜注意養生、防微恙'
};

/* 15. 公曆→農曆自動填盤（用 lunar.js） */
const TIME_ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
function solarToAll(sy, sm, sd, sh){
  if(typeof Solar==='undefined'){ alert('農曆庫加載失敗'); return null; }
  const sol=Solar.fromYmdHms(sy,sm,sd, (sh*2+1)%24>20?23:sh*2, (sh*2+1)%24, 0);
  const lun=sol.getLunar();
  const yearGz=lun.getYearInGanZhi();
  const yearGan=yearGz[0], yearZhi=yearGz[1];
  const month=lun.getMonth(), day=lun.getDay();
  // 命宮 + 五行局
  const ms=mingShenGong(month, sh);
  const gzMap=palaceGanZhi(yearGan);
  const mingGZ=gzMap[ms.mingZhi];
  const wj=wuxingJu(mingGZ);
  return {yearGan, yearZhi, month, day, hour:sh, ju:wj.ju, juNum:wj.juNum, juName:wj.juName, naYin:wj.naYin, mingZhi:ms.mingZhi, mingGZ};
}
function applySolar(){
  const sy=parseInt(document.getElementById('sy').value,10);
  const sm=parseInt(document.getElementById('sm').value,10);
  const sd=parseInt(document.getElementById('sd').value,10);
  const sh=parseInt(document.getElementById('sh').value,10);
  if(!sy||!sm||!sd){ alert('請填完整公曆生日'); return; }
  const r=solarToAll(sy,sm,sd,sh);
  if(!r) return;
  // 填入手動欄位
  document.getElementById('yearGan').value=r.yearGan;
  document.getElementById('yearZhi').value=r.yearZhi;
  document.getElementById('month').value=r.month;
  document.getElementById('day').value=r.day;
  document.getElementById('hour').value=r.hour;
  // 五行局：單字(火)+中文數(六) -> 下拉值
  const CN=['零','一','二','三','四','五','六'];
  if(r.ju && r.juNum){
    const juVal=r.ju+CN[r.juNum]+'局';
    document.getElementById('ju').value=juVal;
  }
  render();
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

  // 大限
  const dx=calcDaxian(yearGan, gender, ms.mingZhi, ju);
  const currentAge=parseInt(document.getElementById('age').value,10)||1;
  const dxDesc=(dx.shun?'陽男/陰女順行':'陰男/陽女逆行')+' · '+wj.juName+'起運 '+dx.start+'歲';
  document.getElementById('daxianDesc').textContent=dxDesc;
  document.getElementById('daxianList').innerHTML=dx.res.map(l=>{
    const isCur = currentAge>=l.startAge && currentAge<=l.startAge+9;
    return `<div class="dx-item${isCur?' dx-cur':''}"><span class="dx-age">${l.startAge}歲</span><span class="dx-name">${l.name} · ${l.zhi}${isCur?'<em class="dx-tag">當運</em>':''}</span><span class="dx-range">${l.startAge}-${l.startAge+9}歲</span></div>`;
  }).join('');

  // 流年太歲 + 小限 + 十二神煞
  document.getElementById('liunianPanel').style.display='';
  const lyGan=document.getElementById('lyGan').value;
  const lyZhi=document.getElementById('lyZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const ln=calcLiunian(lyGan, lyZhi, ms.mingZhi, gender, age);
  const lySihuaStr='祿'+ln.lySihua.祿+' 權'+ln.lySihua.權+' 科'+ln.lySihua.科+' 忌'+ln.lySihua.忌;
  const sihuaGloss=Object.entries(ln.lySihua).map(([k,star])=>`${star}${k}：${SI_HUA_DESC[k]||''}`).join('；');
  document.getElementById('liunianResult').innerHTML=
    `<div class="ln-item"><span class="ln-label">流年太歲</span><span class="ln-val">${lyGan}${lyZhi}年 · ${ln.lyName}（${lyZhi}宮）</span></div>`+
    `<div class="ln-item"><span class="ln-label">流年四化</span><span class="ln-val">${lySihuaStr}</span></div>`+
    `<div class="ln-item ln-gloss"><span class="ln-label">四化斷語</span><span class="ln-val">${sihuaGloss}</span></div>`+
    `<div class="ln-item"><span class="ln-label">小限</span><span class="ln-val">${age}歲 → ${ln.xName}（${ln.xZhi}宮）</span></div>`;
  // 記錄高亮宮位（供渲染用）
  window.__hlLy=lyZhi;
  window.__hlX=ln.xZhi;
  // 流年四化標記：星->字（供盤上標注，金色）
  const lySihuaMark={};
  Object.entries(ln.lySihua).forEach(([k,star])=>lySihuaMark[star]=k);
  window.__lySihuaMark=lySihuaMark;
  // 十二神煞
  const SS=['歲建','晦氣','喪門','貫索','官符','小耗','大耗','龍德','白虎','天德','弔客','病符'];
  const ssStart=zIdx(lyZhi);
  document.getElementById('shenshaGrid').innerHTML=SS.map((s,i)=>{
    const z=ZHI[n12(ssStart+i)];
    const isLy = z===lyZhi;
    const desc=SS_DESC[s]||'';
    return `<div class="ss-item${isLy?' ss-ly':''}" title="${desc}"><span class="ss-name">${s}</span><span class="ss-zhi">${z}宮</span><span class="ss-desc">${desc}</span></div>`;
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
    // 宮位主題 + 主星特質斷語
    const theme=PALACE_THEME[lyPalace.name]||'';
    const mainStarTrait=lyPalace.stars.map(s=>STAR_KEY[s]).filter(Boolean);
    const traitStr=mainStarTrait.length?
      '· '+lyPalace.stars.filter(s=>STAR_KEY[s]).map(s=>s+STAR_KEY[s]).join('、')
      :'· 空宮宜兼看對宮';
    const el=document.createElement('div');
    el.className='ln-item ln-focus';
    el.innerHTML=`<span class="ln-label">流年重點</span><span class="ln-val"><em>${lyPalace.name}（${lyPalace.zhi}宮）</em>·${theme}${traitStr}　星曜：${starStr}</span>`;
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
      // 中間 2x2 放中心宮（grid item，天然不遮宮格）
      if(r>=1 && r<=2 && c>=1 && c<=2){
        if(r===1 && c===1){
          const cs=document.createElement('div');
          cs.className='center-square';
          cs.innerHTML=`<div class="center-gz">${mingGZ}</div><div class="center-name">${(wj.juName||'')}·命盤</div>`;
          chart.appendChild(cs);
        }
        continue;
      }
      const cell=cells[r][c];
      if(!cell){ continue; }
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
      // 精確定位到 4x4 網格
      div.style.gridRow=(r+1)+' / '+(r+2);
      div.style.gridColumn=(c+1)+' / '+(c+2);
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

  // 三方四正（命宮 + 財帛 + 官祿 + 遷移）
  document.getElementById('sanfangPanel').style.display='';
  const sfIdx=[0,4,6,8]; // 命/財帛/遷移/官祿 (PALACE_NAMES 逆時針序)
  const sfLabels={0:'命宮',4:'財帛',6:'遷移',8:'官祿'};
  const sfHtml=sfIdx.map(i=>{
    const p=order[i];
    const sfStars=[...p.stars.map(s=>{let t=s;if(sihuaMark[s])t+='('+sihuaMark[s]+')';return t;}),...p.aux];
    const starStr=sfStars.length?sfStars.join('、'):'（空宮）';
    return `<div class="sf-item"><div class="sf-name">${sfLabels[i]}<span class="sf-zhi">${p.zhi}宮</span></div><div class="sf-gz">${p.gz}</div><div class="sf-stars">${starStr}</div></div>`;
  }).join('');
  document.getElementById('sanfangGrid').innerHTML=sfHtml;

  // 命宮主星斷語
  const mingPalace=order[0];
  const mingStars=mingPalace.stars.filter(s=>STAR_DESC[s]);
  const dyBlock=document.getElementById('duanyuBlock');
  const dyList=document.getElementById('duanyuList');
  if(mingStars.length){
    dyBlock.style.display='';
    dyList.innerHTML=mingStars.map(s=>{
      const hua=sihuaMark[s]?'（'+sihuaMark[s]+'）':'';
      return `<div class="dy-item"><span class="dy-star">${s}${hua}</span><span class="dy-text">${STAR_DESC[s]}</span></div>`;
    }).join('');
  } else {
    dyBlock.style.display='none';
    // 空宮提示
    if(!mingPalace.stars.length){
      const duiZhi=ZHI[n12(zIdx(mingPalace.zhi)+6)]; // 對宮=+6
      const duiPal=order.find(o=>o.zhi===duiZhi);
      const duiStars=duiPal?duiPal.stars.join('、'):'無';
      const duiName=duiPal?duiPal.name:'';
      const empty=document.getElementById('duanyuList');
      dyBlock.style.display='';
      empty.innerHTML=`<div class="dy-item"><span class="dy-star">空宮</span><span class="dy-text">${mingPalace.name}無主星，實務上借對宮〈${duiName}·${duiZhi}宮〉論斷：${duiStars}（文化參考）</span></div>`;
    }
  }

  // 保存命盤數據，供導出圖片用
  window.__chartData={order, ms, zz, tf, mingGZ, wj, yearGan, sihuaMark, lyZhi};
}

document.getElementById('calcBtn').addEventListener('click', render);
document.getElementById('solarBtn').addEventListener('click', applySolar);
// 自動推流年：出生年干支 + 虛歲 → 流年干支
function autoLiunian(){
  const bGan=document.getElementById('yearGan').value;
  const bZhi=document.getElementById('yearZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const off=age-1;
  const g=GAN[n10(gIdx(bGan)+off)];
  const z=ZHI[n12(zIdx(bZhi)+off)];
  document.getElementById('lyGan').value=g;
  document.getElementById('lyZhi').value=z;
  render();
}
document.getElementById('autoLyBtn').addEventListener('click', autoLiunian);
// 初始排一張
window.addEventListener('DOMContentLoaded', render);

// 導出命盤圖片（原生 Canvas 重繪，不依賴外部庫）
function exportChart(){
  const d=window.__chartData;
  if(!d||!d.order) return;
  const S=760, CELL=S/4; // 畫布尺寸
  const cv=document.createElement('canvas');
  cv.width=S; cv.height=S;
  const ctx=cv.getContext('2d');
  // 背景
  ctx.fillStyle='#1a1108'; ctx.fillRect(0,0,S,S);
  // 排版地圖（與 DOM 相同的方位）
  const P=[[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0]];
  const cellData=Array(4).fill().map(()=>Array(4).fill(null));
  d.order.forEach((o,i)=>{ cellData[P[i][0]][P[i][1]]=o; });
  const cx=2, cy=2, cw=CELL-4, ch=CELL-4;
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      const o=cellData[r][c];
      if(!o) continue;
      const x=c*CELL, y=r*CELL;
      // 宮格背景
      ctx.fillStyle= o.zhi===d.lyZhi ? 'rgba(201,164,88,.16)' : 'rgba(255,250,238,.05)';
      ctx.strokeStyle='rgba(201,164,88,.5)';
      ctx.lineWidth= o.zhi===d.lyZhi?2:1;
      ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
      ctx.strokeRect(x+1.5,y+1.5,CELL-3,CELL-3);
      // 宮名 + 干支
      ctx.fillStyle='#c9a458'; ctx.font='bold 22px "Noto Serif TC",serif';
      ctx.textBaseline='middle';
      let name=o.name;
      if(o.isMing) name+='·命'; if(o.isShen) name+='·身';
      ctx.fillText(name, x+14, y+24);
      ctx.fillStyle='#7a6a50'; ctx.font='17px "Noto Serif TC",serif';
      ctx.textAlign='right';
      ctx.fillText(o.gz, x+CELL-14, y+24);
      ctx.textAlign='left';
      // 星曜
      const stars=[...o.stars.map(s=>{let t=s; if(d.sihuaMark&&d.sihuaMark[s])t+=''+d.sihuaMark[s]; return t;}), ...o.aux];
      ctx.font='17px "Noto Serif TC",serif';
      let sy=y+56;
      stars.forEach(s=>{
        ctx.fillStyle='#7cb295'; ctx.fillText(s, x+14, sy); sy+=26;
      });
    }
  }
  // 中心天命
  ctx.fillStyle='#2c1b0c'; ctx.fillRect(S/2-110,S/2-110,220,220);
  ctx.strokeStyle='#c9a458'; ctx.lineWidth=2; ctx.strokeRect(S/2-110.5,S/2-110.5,221,221);
  ctx.fillStyle='#e6cf96'; ctx.font='bold 34px "Noto Serif TC",serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(d.mingGZ, S/2, S/2-8);
  ctx.fillStyle='#7a6a50'; ctx.font='20px "Noto Serif TC",serif';
  ctx.fillText('命盤', S/2, S/2+40);
  ctx.textAlign='left';
  // 下載
  cv.toBlob(b=>{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(b);
    a.download='ziwei-chart-'+d.yearGan+d.zz+'.png';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
document.getElementById('exportBtn').addEventListener('click', exportChart);

})();
