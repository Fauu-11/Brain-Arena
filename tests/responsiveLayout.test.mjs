import test from 'node:test';
import assert from 'node:assert/strict';
import React,{useState} from 'react';
import {act,create} from 'react-test-renderer';
import {fitBoardCell} from '../src/utils/responsiveLayout.js';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {useBoardSizing} from '../src/hooks/useBoardSizing.js';

test('small boards fit mobile, tablet and desktop containers without reducing their column count',()=>{
  for(const viewport of [320,360,390,430,568,768,800,1024,1440]){
    const width=viewport-64;
    for(const columns of [3,4,5,6,8,9]){
      const cell=fitBoardCell(width,columns,{gap:2,gutter:14,min:24,max:44});
      const boardWidth=columns*cell+(columns-1)*2+14;
      if(cell>24)assert.ok(boardWidth<=width,`${viewport}px ${columns} columns`);
      assert.ok(cell>=24&&cell<=44);
    }
  }
});
test('large boards retain readable cells and can be panned instead of collapsing into tiny targets',()=>{
  const width=256,columns=20;
  const cell=fitBoardCell(width,columns,{gutter:140,min:24,max:52});
  assert.equal(cell,24);assert.ok(columns*cell+140>width);
  assert.equal(fitBoardCell(width,columns,{gutter:140,min:24,max:52,zoom:1.5}),36);
});
test('board sizing observes the mounted scroll container and adapts when its size changes',async()=>{
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const previousWindow=globalThis.window,previousObserver=globalThis.ResizeObserver;
  let observer,hook,renderer;
  globalThis.window={innerWidth:390,addEventListener(){},removeEventListener(){}};
  globalThis.ResizeObserver=class{constructor(callback){observer=callback;}observe(){}disconnect(){}};
  const node={clientWidth:260};
  function Harness(){hook=useBoardSizing(5,{gutter:10,min:24,max:60});return React.createElement('div',{ref:hook.ref});}
  try{
    await act(async()=>{renderer=create(React.createElement(Harness),{createNodeMock:()=>node});});
    assert.equal(hook.cell,50);
    node.clientWidth=310;await act(async()=>observer());assert.equal(hook.cell,60);
    await act(async()=>hook.setZoom(1.5));assert.equal(hook.cell,90);
  }finally{if(renderer)await act(async()=>renderer.unmount());globalThis.window=previousWindow;globalThis.ResizeObserver=previousObserver;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
test('touch zoom controls clamp their limits and reset without changing the game board',async()=>{
  const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true,hmr:false,ws:false}});
  const {default:BoardZoom}=await server.ssrLoadModule('/src/components/BoardZoom.jsx');
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  let renderer,value;
  function Harness(){const [zoom,setZoom]=useState(1);value=zoom;return React.createElement(BoardZoom,{value:zoom,onChange:setZoom,lang:'id'});}
  try{
    await act(async()=>{renderer=create(React.createElement(Harness));});
    for(let i=0;i<6;i++)await act(async()=>renderer.root.findByProps({'aria-label':'Perbesar papan'}).props.onClick());
    assert.equal(value,1.75);assert.equal(renderer.root.findByProps({'aria-label':'Perbesar papan'}).props.disabled,true);
    await act(async()=>renderer.root.findByProps({'aria-label':'Reset zoom papan'}).props.onClick());assert.equal(value,1);
    for(let i=0;i<3;i++)await act(async()=>renderer.root.findByProps({'aria-label':'Perkecil papan'}).props.onClick());assert.equal(value,.75);
  }finally{if(renderer)await act(async()=>renderer.unmount());delete globalThis.IS_REACT_ACT_ENVIRONMENT;await server.close();}
});
