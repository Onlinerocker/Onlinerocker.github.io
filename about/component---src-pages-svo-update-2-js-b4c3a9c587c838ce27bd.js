(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{"/2wD":function(e,t,a){"use strict";a.d(t,"a",(function(){return i}));var r=a("q1tI"),n=a.n(r),l=a("RMg3");function i(e){return n.a.createElement(l.a,{items:["Projects","Resume","Blog","About"],links:["/","/resume","/blog","/about"]})}},"2mvg":function(e,t,a){"use strict";var r=a("wx14"),n=a("zLVn"),l=a("TSYQ"),i=a.n(l),o=a("q1tI"),s=a.n(o),c=a("17x9"),u=a.n(c),d=a("vUet"),m=(u.a.string,u.a.bool,u.a.bool,u.a.bool,u.a.bool,s.a.forwardRef((function(e,t){var a=e.bsPrefix,l=e.className,o=e.fluid,c=e.rounded,u=e.roundedCircle,m=e.thumbnail,h=Object(n.a)(e,["bsPrefix","className","fluid","rounded","roundedCircle","thumbnail"]);a=Object(d.a)(a,"img");var b=i()(o&&a+"-fluid",c&&"rounded",u&&"rounded-circle",m&&a+"-thumbnail");return s.a.createElement("img",Object(r.a)({ref:t},h,{className:i()(l,b)}))})));m.displayName="Image",m.defaultProps={fluid:!1,rounded:!1,roundedCircle:!1,thumbnail:!1},t.a=m},"6xyR":function(e,t,a){"use strict";var r=a("wx14"),n=a("zLVn"),l=a("TSYQ"),i=a.n(l),o=a("q1tI"),s=a.n(o),c=a("vUet"),u=a("YdCC"),d=function(e){return s.a.forwardRef((function(t,a){return s.a.createElement("div",Object(r.a)({},t,{ref:a,className:i()(t.className,e)}))}))},m=a("Wzyw"),h=s.a.forwardRef((function(e,t){var a=e.bsPrefix,l=e.className,o=e.variant,u=e.as,d=void 0===u?"img":u,m=Object(n.a)(e,["bsPrefix","className","variant","as"]),h=Object(c.a)(a,"card-img");return s.a.createElement(d,Object(r.a)({ref:t,className:i()(o?h+"-"+o:h,l)},m))}));h.displayName="CardImg",h.defaultProps={variant:null};var b=h,f=d("h5"),p=d("h6"),E=Object(u.a)("card-body"),g=Object(u.a)("card-title",{Component:f}),v=Object(u.a)("card-subtitle",{Component:p}),y=Object(u.a)("card-link",{Component:"a"}),w=Object(u.a)("card-text",{Component:"p"}),x=Object(u.a)("card-header"),I=Object(u.a)("card-footer"),T=Object(u.a)("card-img-overlay"),N=s.a.forwardRef((function(e,t){var a=e.bsPrefix,l=e.className,u=e.bg,d=e.text,h=e.border,b=e.body,f=e.children,p=e.as,g=void 0===p?"div":p,v=Object(n.a)(e,["bsPrefix","className","bg","text","border","body","children","as"]),y=Object(c.a)(a,"card"),w=Object(o.useMemo)((function(){return{cardHeaderBsPrefix:y+"-header"}}),[y]);return s.a.createElement(m.a.Provider,{value:w},s.a.createElement(g,Object(r.a)({ref:t},v,{className:i()(l,y,u&&"bg-"+u,d&&"text-"+d,h&&"border-"+h)}),b?s.a.createElement(E,null,f):f))}));N.displayName="Card",N.defaultProps={body:!1},N.Img=b,N.Title=g,N.Subtitle=v,N.Body=E,N.Link=y,N.Text=w,N.Header=x,N.Footer=I,N.ImgOverlay=T;t.a=N},clQR:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return c}));var r=a("q1tI"),n=a.n(r),l=a("7vrA"),i=a("6xyR"),o=a("/2wD"),s=a("2mvg");function c(){return n.a.createElement("div",null,n.a.createElement("link",{rel:"stylesheet",href:"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",integrity:"sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk",crossorigin:"anonymous"}),n.a.createElement(o.a,null),n.a.createElement(l.a,{fluid:!0},n.a.createElement("br",null),n.a.createElement(i.a,{style:{maxWidth:"1200px"}},n.a.createElement(i.a.Header,{style:{background:"#EEEEEE"}},"6/9/2022"),n.a.createElement(i.a.Body,null,n.a.createElement(i.a.Title,null,n.a.createElement("h2",null,"SVO Ray Tracer Update #2")),n.a.createElement("a",{href:"https://github.com/Onlinerocker/SVO"},"Project's GitHub Repo"),n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement(i.a.Title,null,"Creating a Contiguous Data Format"),"When I initially conceptualized what an octree might look like as a data structure I thought of using pointers. The root node will store a list of pointers to each of its children. Simple! Not so simple, however… First of all, pointers weren’t going to perform due to cache incoherency. But second of all, and perhaps the bigger issue, how was the GPU going to make sense of a list of pointers to CPU side memory? (spoiler: it can't)",n.a.createElement("br",null),n.a.createElement("br",null),"To solve both these issues I decided a contiguous format was going to be best. Luckily, NVIDIA had already solved the problem for me in their paper ",n.a.createElement("a",{href:"https://www.nvidia.com/docs/IO/88972/nvr-2010-001.pdf"},"Efficient Sparse Voxel Octrees – Analysis, Extensions, and Implementation"),".",n.a.createElement("br",null),n.a.createElement("br",null),"The octree is represented with a contiguous “block” of memory. Each entry in the block represents one voxel and its children (meaning leaf children need not be stored). NVIDIA has 64-bit entries. 32 of these bits are used to encode voxel validity and children locations. The other 32 are used for contour information.",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("i",null,"NVIDIA's contiguous SVO format (credit: NVIDIA)"),n.a.createElement("br",null),n.a.createElement(s.a,{src:"../svo_contig_form.png",style:{width:"40%",maxWidth:"500px",paddingRight:"19px"}}),n.a.createElement("br",null),n.a.createElement("br",null),"The 15-bit child pointer is a relative pointer to the location of the voxel’s children. The 1-bit far pointer determines if the child is farther than 15 bits worth of indices away (more on this later). The 8-bit valid mask is a bitmask that encodes which children voxels are actually present in the octree. The 8-bit leaf mask is a bitmask that encodes which of children voxels are leaves.",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("i",null,"Visual explanation of how the child pointers work (credit: NVIDIA)"),n.a.createElement("br",null),n.a.createElement(s.a,{src:"../svo_contig_form1.png",style:{width:"40%",maxWidth:"500px",paddingRight:"19px"}}),n.a.createElement("br",null),"As mentioned above NVIDIA uses a 1-bit far pointer, which in turn means the child pointer points to a bigger 32-bit far pointer to find the children nodes. However, since I’m not implementing contour information, I decided to forgo the far pointer and always use a 32-bit child pointer. This means each of my entries is still only 64-bits:",n.a.createElement("br",null),n.a.createElement("br",null),"• 32-bit child pointer",n.a.createElement("br",null),"• 8-bit valid mask",n.a.createElement("br",null),"• 8-bit leaf mask",n.a.createElement("br",null),"• 16-bits of padding for alignment",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement(i.a.Title,null,"Uploading To The GPU"),"After I created my contiguous data format I added another constant buffer to the pixel shader to store this information. I wasn’t sure of a way to have a variable sized array in my pixel shader's constant buffer. So, for now, the buffer just has a hardcoded maximum size.",n.a.createElement("br",null),n.a.createElement("br",null),"I also ran into a lot of pain wrestling with DX11, trying to make the proper API call to set two constant buffers. Finally, I realized I needed to call ",n.a.createElement("i",null,"PSSetConstantBuffers")," once while passing in an array of ",n.a.createElement("i",null,"ID3D11Buffer")," pointers after creating my constant buffers.",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement(i.a.Text,{style:{fontFamily:"monospace",color:"white",background:"#333333",padding:"10px"}},"ID3D11Buffer* constBuffers[2]; ",n.a.createElement("br",null),"…",n.a.createElement("br",null),"dev->CreateBuffer(&constBuffDesc0, nullptr, &constBuffers[0]);",n.a.createElement("br",null),"dev->CreateBuffer(&constBuffDesc1, nullptr, &constBuffers[1]);",n.a.createElement("br",null),"…",n.a.createElement("br",null),"devCon->PSSetConstantBuffers(0, 2 /*number of buffers*/, constBuffers /*array of buffers*/);",n.a.createElement("br",null),"…",n.a.createElement("br",null),"devCon->UpdateSubresource(constBuffers[0], 0, nullptr, &appInfo, 0, 0);",n.a.createElement("br",null),"devCon->UpdateSubresource(constBuffers[1], 0, nullptr, svo.vec().data(), 0, 0);",n.a.createElement("br",null)),n.a.createElement("br",null),"It didn’t help that RenderDoc only cared to show the constant buffer if it was actually being used for the pixel shader output. I’m not sure if the shader compiler is optimizing the constant buffer out, or RenderDoc is just being bad. Either way, make sure the buffers are actually contributing to the color output, or else they just won’t show up in RenderDoc (and you’ll start to go extra crazy when trying to debug).",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement(i.a.Title,null,"Basic Traversal"),"The biggest limitation of my ray tracer at this point was that it could only render the root voxel. It was time to begin implementing the core of this project, the ray traversal algorithm. Again, I consulted that nifty NVIDIA paper for some guidance…",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("i",null,"NVIDIA's traversal algorithm (credit: NVIDIA)"),n.a.createElement("br",null),n.a.createElement(s.a,{src:"../svo_traversal.png",style:{width:"40%",maxWidth:"500px",paddingRight:"19px"}}),n.a.createElement("br",null),n.a.createElement("br",null),"Visually, the algorithm is intuitive. Each voxel is visited in the order the ray intersected it, with voxels higher in the hierarchy being visited first.",n.a.createElement("br",null),n.a.createElement("br",null),"The actually implementation of this is somewhat intuitive, but still fairly complex. NVIDIA provides some pseudo-code for the algorithm, and it was clear to me I needed to start small to understand the basic ideas first.",n.a.createElement("br",null),n.a.createElement("br",null),"One core idea of this algorithm is utilizing the entry and exit points of the ray when it intersects with a voxel. The entry point implies which of the children voxels the ray intersected with, and the exit point implies which of the children voxels the traversal should visit next. The exit point of a child implies if the ray left the root voxel, if it matches root voxel intersection exit point.",n.a.createElement("br",null),n.a.createElement("br",null),"I decided to use this information to write a very basic traversal algorithm. My algorithm will traverse all children of a given root voxel, but does not recurse down to traverse the next level of children.",n.a.createElement("br",null),n.a.createElement("br",null),"To demo this, I created an interesting shape, added a moving light, and added some color for visualization. Red means the ray instantly hit that child and didn’t require traversal. Green means the ray intersected eventually, but required traversal. Purple means the ray left the root. Blue means it didn’t intersect the ray at all. White is a visualization of the light’s current location. Here’s a quick demo video!",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("iframe",{width:"560",height:"315",src:"https://www.youtube.com/embed/cD3hO_PX5RY",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0}),n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement(i.a.Title,null,"What's Next?"),"Next steps:",n.a.createElement("br",null),"• Traversing down the hierarchy",n.a.createElement("br",null),"• Rendering two or more levels of depth in the octree",n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("br",null)))),n.a.createElement("br",null))}}}]);
//# sourceMappingURL=component---src-pages-svo-update-2-js-b4c3a9c587c838ce27bd.js.map