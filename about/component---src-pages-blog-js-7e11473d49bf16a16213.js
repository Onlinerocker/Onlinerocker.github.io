(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"/2wD":function(e,t,a){"use strict";a.d(t,"a",(function(){return l}));var r=a("q1tI"),n=a.n(r),i=a("RMg3");function l(e){return n.a.createElement(i.a,{items:["Projects","Resume","Blog","About"],links:["/","/resume","/blog","/about"]})}},"6xyR":function(e,t,a){"use strict";var r=a("wx14"),n=a("zLVn"),i=a("TSYQ"),l=a.n(i),o=a("q1tI"),s=a.n(o),c=a("vUet"),d=a("YdCC"),m=function(e){return s.a.forwardRef((function(t,a){return s.a.createElement("div",Object(r.a)({},t,{ref:a,className:l()(t.className,e)}))}))},u=a("Wzyw"),b=s.a.forwardRef((function(e,t){var a=e.bsPrefix,i=e.className,o=e.variant,d=e.as,m=void 0===d?"img":d,u=Object(n.a)(e,["bsPrefix","className","variant","as"]),b=Object(c.a)(a,"card-img");return s.a.createElement(m,Object(r.a)({ref:t,className:l()(o?b+"-"+o:b,i)},u))}));b.displayName="CardImg",b.defaultProps={variant:null};var h=b,p=m("h5"),g=m("h6"),f=Object(d.a)("card-body"),E=Object(d.a)("card-title",{Component:p}),y=Object(d.a)("card-subtitle",{Component:g}),w=Object(d.a)("card-link",{Component:"a"}),v=Object(d.a)("card-text",{Component:"p"}),x=Object(d.a)("card-header"),k=Object(d.a)("card-footer"),O=Object(d.a)("card-img-overlay"),j=s.a.forwardRef((function(e,t){var a=e.bsPrefix,i=e.className,d=e.bg,m=e.text,b=e.border,h=e.body,p=e.children,g=e.as,E=void 0===g?"div":g,y=Object(n.a)(e,["bsPrefix","className","bg","text","border","body","children","as"]),w=Object(c.a)(a,"card"),v=Object(o.useMemo)((function(){return{cardHeaderBsPrefix:w+"-header"}}),[w]);return s.a.createElement(u.a.Provider,{value:v},s.a.createElement(E,Object(r.a)({ref:t},y,{className:l()(i,w,d&&"bg-"+d,m&&"text-"+m,b&&"border-"+b)}),h?s.a.createElement(f,null,p):p))}));j.displayName="Card",j.defaultProps={body:!1},j.Img=h,j.Title=E,j.Subtitle=y,j.Body=f,j.Link=w,j.Text=v,j.Header=x,j.Footer=k,j.ImgOverlay=O;t.a=j},vx99:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return d}));var r=a("q1tI"),n=a.n(r),i=a("6xyR");function l(e){return n.a.createElement(i.a,{style:{maxWidth:"1200px"}},n.a.createElement(i.a.Header,{style:{background:"#EEEEEE"}},e.date),n.a.createElement(i.a.Body,null,n.a.createElement(i.a.Title,null,e.title),n.a.createElement("iframe",{width:"560",height:"315",style:{paddingRight:"19px",width:"90%",height:"90vh",maxWidth:560,maxHeight:315},src:e.video,frameborder:"0",allowfullscreen:!0}),n.a.createElement(i.a.Text,null,e.body)))}function o(e){return n.a.createElement(i.a,{style:{maxWidth:"1200px"}},n.a.createElement(i.a.Header,{style:{background:"#EEEEEE"}},e.date),n.a.createElement(i.a.Body,null,n.a.createElement(i.a.Title,null,e.title),n.a.createElement(i.a.Text,null,e.body),n.a.createElement("a",{href:e.link},e.linktext)))}var s=a("7vrA"),c=a("/2wD");function d(){return n.a.createElement("div",null,n.a.createElement("link",{rel:"stylesheet",href:"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",integrity:"sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk",crossorigin:"anonymous"}),n.a.createElement(c.a,null),n.a.createElement("br",null),n.a.createElement(s.a,{fluid:!0},n.a.createElement("br",null),n.a.createElement(o,{date:"6/9/2022",title:"SVO Ray Tracer Update #2",body:"This week I wrote the SVO data structure, uploaded it to the GPU, and began the traversal algorithm! I also created a demo with some fun colors and lighting to help visualize the algorithm.",linktext:"Read More",link:"/svo_update2"}),n.a.createElement("br",null),n.a.createElement(o,{date:"6/3/2022",title:"SVO Ray Tracer Update #1",body:"I'm working on a real-time voxel ray tracer using sparse voxel octrees! I just released\r my first blog post - setting up the project and implementing ray-box intersection.",linktext:"Read More",link:"/svo_update1"}),n.a.createElement("br",null),n.a.createElement(o,{date:"5/22/2021",title:"Creating a Snow Post Process Effect",body:"This blog will be dedicated to breaking down the technical details of the snowy weather post-process effect in my upcoming puzzle game. \r I implemented this within \r my custom engine, but it could be done in any engine that supports custom shaders and post processing...",linktext:"Read More",link:"/snow_effect"}),n.a.createElement("br",null),n.a.createElement(l,{date:"4/27/2021",title:"'Portal' System Demo",body:"I've had my nose to the grindstone and am making fast progress on the engine. I recently added a system that will load new maps when the player enters a specific tile.\r One application of this is for entering/exiting buildings, where the interior and exterior are separate map files. I put together a short video to demonstrate this. Enjoy!",video:"https://www.youtube.com/embed/aWF_azFEgNI"}),n.a.createElement("br",null),n.a.createElement(l,{date:"4/24/2021",title:"NATURAL Engine Map Editor",body:"I've been working on a tile-based 2D engine using C++, OpenGL, and SDL2 (for input/audio). For now, I'm calling it NATURAL Engine. This is a short demo\r of the engine's map editor. Not shown in this video is its ability to load and save maps in a binary format.",video:"https://www.youtube.com/embed/rV9T1dKSBs0"}),n.a.createElement("br",null)),n.a.createElement("br",null))}}}]);
//# sourceMappingURL=component---src-pages-blog-js-7e11473d49bf16a16213.js.map