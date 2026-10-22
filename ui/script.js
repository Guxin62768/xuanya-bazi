/* 紫微斗数排盘 · 页面逻辑 */
(function () {
  'use strict';
  var E = window.ZiweiEngine;
  var form = document.getElementById('chart-form');
  var hint = document.getElementById('lunar-hint');
  var result = document.getElementById('result');

  // 十二宫在 4x4 网格中的位置（按地支：子在下、顺时针排，符合传统命盘方位）
  // 传统方位：寅=右下区…这里采用「地支顺时针排布」的常见 4x4 布局
  // 网格顺序（左上→右下）对应的地支序：
  var GRID_ZHI = [5, 6, 7, 8,   // 巳 午 未 申
                  4, -1, -1, 9, // 辰 [中] [中] 酉
                  3, -1, -1, 10,// 卯 [中] [中] 戌
                  2, 1, 0, 11]; // 寅 丑 子 亥

  function sihuaOf(starName, sihua) {
    if (!sihua) return null;
    if (sihua.禄 === starName) return '祿';
    if (sihua.权 === starName) return '權';
    if (sihua.科 === starName) return '科';
    if (sihua.忌 === starName) return '忌';
    return null;
  }

  function renderChart(c) {
    var chart = document.getElementById('chart');
    chart.innerHTML = '';

    GRID_ZHI.forEach(function (zi, i) {
      var cell;
      if (zi === -1) {
        if (i === 5) {
          // 中央信息格（占据 2x2）
          cell = document.createElement('div');
          cell.className = 'cell-center';
          cell.innerHTML =
            '<div class="center-name">' + (c.input.gender === 'male' ? '乾造' : '坤造') + '</div>' +
            '<div class="center-meta">' + c.lunar.y + '年 ' + c.lunar.m + '月 ' + c.lunar.d + '日' + (c.lunar.isLeap ? '（閏）' : '') + '</div>' +
            '<div class="center-meta">' + c.yearGanZhi + '年</div>' +
            '<div class="center-ju">' + c.juName + '</div>' +
            '<div class="center-meta">命宮 ' + c.mingGan + c.mingZhi + '</div>';
          chart.appendChild(cell);
        }
        return;
      }

      var p = c.palaces[zi];
      cell = document.createElement('div');
      cell.className = 'cell' + (p.isMing ? ' ming' : '') + (p.isShen && !p.isMing ? ' shen' : '');

      var head = document.createElement('div');
      head.className = 'cell-head';
      head.innerHTML =
        '<span class="palace">' + p.name +
          (p.isMing ? '<span class="badge ming-b">命</span>' : '') +
          (p.isShen && !p.isMing ? '<span class="badge shen-b">身</span>' : '') +
        '</span>' +
        '<span class="gz"><b>' + p.gan + p.zhi + '</b></span>';
      cell.appendChild(head);

      var stars = document.createElement('div');
      stars.className = 'stars';
      var MAJOR = ['紫微','天机','太阳','武曲','天同','廉贞','天府','太阴','贪狼','巨门','天相','天梁','七杀','破军'];
      p.stars.forEach(function (s) {
        var sp = document.createElement('span');
        var sh = sihuaOf(s, c.sihua);
        sp.className = 'star' + (MAJOR.indexOf(s) >= 0 ? ' major' : '');
        sp.innerHTML = s + (sh ? '<span class="sihua-tag sihua-' + sh + '">' + sh + '</span>' : '');
        stars.appendChild(sp);
      });
      cell.appendChild(stars);
      chart.appendChild(cell);
    });
  }

  function renderSummary(c) {
    var box = document.getElementById('summary');
    var items = [
      ['西曆', c.input.year + '-' + c.input.month + '-' + c.input.day],
      ['農曆', c.lunar.y + '年' + c.lunar.m + '月' + c.lunar.d + '日'],
      ['干支年', c.yearGanZhi],
      ['五行局', c.juName],
      ['命宮', c.mingGan + c.mingZhi],
      ['身宮', c.palaces[c.shenIdx].gan + c.palaces[c.shenIdx].zhi],
      ['紫微', c.ziweiZhi],
      ['天府', c.tianfuZhi]
    ];
    box.innerHTML = items.map(function (it) {
      return '<div class="sum-item"><div class="k">' + it[0] + '</div><div class="v">' + it[1] + '</div></div>';
    }).join('');
  }

  function renderSihua(c) {
    var box = document.getElementById('sihua-box');
    if (!c.sihua) { box.innerHTML = ''; return; }
    var rows = [
      ['lu', '化祿', c.sihua.禄], ['quan', '化權', c.sihua.权],
      ['ke', '化科', c.sihua.科], ['ji', '化忌', c.sihua.忌]
    ];
    box.innerHTML =
      '<div class="panel-title"><span class="dot"></span> 四化飛星（' + c.yearGanZhi.charAt(0) + '干）</div>' +
      '<div class="sihua-grid">' +
      rows.map(function (r) {
        return '<div class="sihua-card ' + r[0] + '"><div class="h">' + r[1] + '</div><div class="s">' + r[2] + '</div></div>';
      }).join('') +
      '</div>';
  }


  // ---------- 财运 ----------
  function renderWealth(c) {
    var A = window.ZiweiAnalysis;
    if (!A) return;
    var w = A.wealthOf(c);
    document.getElementById('wealth-level').textContent = w.level || '—';
    document.getElementById('wealth-tags').innerHTML = (w.tags || []).map(function (t) {
      return '<span class="wtag">' + t + '</span>';
    }).join('');
    document.getElementById('wealth-list').innerHTML = w.items.map(function (it) {
      return '<div class="wealth-item"><div class="wi-k">' + it.k + '</div><div class="wi-v">' + it.v + '</div></div>';
    }).join('');
    document.getElementById('wealth-panel').hidden = false;
  }

  // ---------- 命运 ----------
  var _lastChart = null;
  function renderFate(c, age) {
    var A = window.ZiweiAnalysis;
    if (!A) return;
    _lastChart = c;
    var f = A.fateOf(c, age);
    // 大限列表
    document.getElementById('daxian-list').innerHTML = f.daxian.map(function (d) {
      return '<div class="daxian-item' + (d.isCurrent ? ' current' : '') + '">' +
        '<span class="dx-idx">第 ' + d.idx + ' 限</span>' +
        '<span class="dx-name">' + d.name + '</span>' +
        '<span class="dx-zhi">' + d.zhi + '</span>' +
        '<span class="dx-age">' + d.start + '–' + d.end + ' 歲</span>' +
      '</div>';
    }).join('');
    // 当前流年
    var box = document.getElementById('fate-current');
    if (age && f.current && f.liunian) {
      box.innerHTML =
        '<div class="fc-line"><b>當前 ' + age + ' 虛歲</b>：行第 ' + f.current.idx + ' 限（' + f.current.name + '宮 · ' + f.current.start + '–' + f.current.end + ' 歲）</div>' +
        '<div class="fc-line">流年 <b>' + f.liunian.gan + f.liunian.zhi + '</b> 年，落在 <b>' + f.liunian.palace + '宮</b></div>';
    } else {
      box.innerHTML = '<div class="fc-hint">輸入虛歲可查看當前大限與流年</div>';
    }
    document.getElementById('fate-panel').hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var y = parseInt(document.getElementById('f-year').value, 10);
    var m = parseInt(document.getElementById('f-month').value, 10);
    var d = parseInt(document.getElementById('f-day').value, 10);
    var h = parseInt(document.getElementById('f-hour').value, 10);
    var g = document.getElementById('f-gender').value;

    if (!y || !m || !d) { hint.textContent = '請完整填寫年月日'; return; }
    if (y < 1901 || y > 2049) { hint.textContent = '年份請在 1901–2049 之間'; return; }

    var lunar = E.solar2lunar(y, m, d);
    hint.textContent = '農曆：' + lunar.y + '年' + lunar.m + '月' + lunar.d + '日' + (lunar.isLeap ? '（閏月）' : '');

    var chart = E.calcChart({ year: y, month: m, day: d, hour: h, gender: g });
    renderSummary(chart);
    renderChart(chart);
    renderSihua(chart);
    renderWealth(chart);
    var ageVal = parseInt(document.getElementById('f-age').value, 10) || 0;
    renderFate(chart, ageVal);
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('age-btn').addEventListener('click', function () {
    if (!_lastChart) return;
    var ageVal = parseInt(document.getElementById('f-age').value, 10) || 0;
    renderFate(_lastChart, ageVal);
  });

  // URL 参数自动排盘（便于分享具体命盘）
  (function(){
    var p = new URLSearchParams(location.search);
    if (p.get('y') && p.get('m') && p.get('d')) {
      document.getElementById('f-year').value = p.get('y');
      document.getElementById('f-month').value = p.get('m');
      document.getElementById('f-day').value = p.get('d');
      if (p.get('h')) document.getElementById('f-hour').value = p.get('h');
      if (p.get('g')) document.getElementById('f-gender').value = p.get('g');
      form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
    }
  })();
})();
