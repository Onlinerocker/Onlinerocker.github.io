(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{"3Z9Z":function(e,a,t){"use strict";var r=t("wx14"),n=t("zLVn"),l=t("TSYQ"),c=t.n(l),s=t("q1tI"),o=t.n(s),i=t("vUet"),m=["xl","lg","md","sm","xs"],u=o.a.forwardRef((function(e,a){var t=e.bsPrefix,l=e.className,s=e.noGutters,u=e.as,d=void 0===u?"div":u,b=Object(n.a)(e,["bsPrefix","className","noGutters","as"]),f=Object(i.a)(t,"row"),p=f+"-cols",v=[];return m.forEach((function(e){var a,t=b[e];delete b[e];var r="xs"!==e?"-"+e:"";null!=(a=null!=t&&"object"==typeof t?t.cols:t)&&v.push(""+p+r+"-"+a)})),o.a.createElement(d,Object(r.a)({ref:a},b,{className:c.a.apply(void 0,[l,f,s&&"no-gutters"].concat(v))}))}));u.displayName="Row",u.defaultProps={noGutters:!1},a.a=u},"6xyR":function(e,a,t){"use strict";var r=t("wx14"),n=t("zLVn"),l=t("TSYQ"),c=t.n(l),s=t("q1tI"),o=t.n(s),i=t("vUet"),m=t("YdCC"),u=function(e){return o.a.forwardRef((function(a,t){return o.a.createElement("div",Object(r.a)({},a,{ref:t,className:c()(a.className,e)}))}))},d=t("Wzyw"),b=o.a.forwardRef((function(e,a){var t=e.bsPrefix,l=e.className,s=e.variant,m=e.as,u=void 0===m?"img":m,d=Object(n.a)(e,["bsPrefix","className","variant","as"]),b=Object(i.a)(t,"card-img");return o.a.createElement(u,Object(r.a)({ref:a,className:c()(s?b+"-"+s:b,l)},d))}));b.displayName="CardImg",b.defaultProps={variant:null};var f=b,p=u("h5"),v=u("h6"),E=Object(m.a)("card-body"),y=Object(m.a)("card-title",{Component:p}),g=Object(m.a)("card-subtitle",{Component:v}),h=Object(m.a)("card-link",{Component:"a"}),j=Object(m.a)("card-text",{Component:"p"}),x=Object(m.a)("card-header"),O=Object(m.a)("card-footer"),N=Object(m.a)("card-img-overlay"),P=o.a.forwardRef((function(e,a){var t=e.bsPrefix,l=e.className,m=e.bg,u=e.text,b=e.border,f=e.body,p=e.children,v=e.as,y=void 0===v?"div":v,g=Object(n.a)(e,["bsPrefix","className","bg","text","border","body","children","as"]),h=Object(i.a)(t,"card"),j=Object(s.useMemo)((function(){return{cardHeaderBsPrefix:h+"-header"}}),[h]);return o.a.createElement(d.a.Provider,{value:j},o.a.createElement(y,Object(r.a)({ref:a},g,{className:c()(l,h,m&&"bg-"+m,u&&"text-"+u,b&&"border-"+b)}),f?o.a.createElement(E,null,p):p))}));P.displayName="Card",P.defaultProps={body:!1},P.Img=f,P.Title=y,P.Subtitle=g,P.Body=E,P.Link=h,P.Text=j,P.Header=x,P.Footer=O,P.ImgOverlay=N;a.a=P},F2CN:function(e,a,t){"use strict";t.r(a),t.d(a,"default",(function(){return P}));var r=t("q1tI"),n=t.n(r);t("Wbzz");var l=t("RMg3"),c=(t("M29Y"),t("7vrA")),s=t("wx14"),o=t("zLVn"),i=t("TSYQ"),m=t.n(i),u=(t("2W6z"),t("JCAc")),d=t("vUet"),b=t("rQNl"),f=t("VWqr"),p=t("ILyh"),v={variant:void 0,active:!1,disabled:!1},E=n.a.forwardRef((function(e,a){var t=e.bsPrefix,l=e.active,c=e.disabled,i=e.className,u=e.variant,b=e.action,v=e.as,E=e.eventKey,y=e.onClick,g=Object(o.a)(e,["bsPrefix","active","disabled","className","variant","action","as","eventKey","onClick"]);t=Object(d.a)(t,"list-group-item");var h=Object(r.useCallback)((function(e){if(c)return e.preventDefault(),void e.stopPropagation();y&&y(e)}),[c,y]);return n.a.createElement(f.a,Object(s.a)({ref:a},g,{eventKey:Object(p.b)(E,g.href),as:v||(b?g.href?"a":"button":"div"),onClick:h,className:m()(i,t,l&&"active",c&&"disabled",u&&t+"-"+u,b&&t+"-action")}))}));E.defaultProps=v,E.displayName="ListGroupItem";var y=E,g={variant:void 0,horizontal:void 0},h=n.a.forwardRef((function(e,a){var t,r=Object(u.a)(e,{activeKey:"onSelect"}),l=r.className,c=r.bsPrefix,i=r.variant,f=r.horizontal,p=r.as,v=void 0===p?"div":p,E=Object(o.a)(r,["className","bsPrefix","variant","horizontal","as"]),y=Object(d.a)(c,"list-group");return t=f?!0===f?"horizontal":"horizontal-"+f:null,n.a.createElement(b.a,Object(s.a)({ref:a},E,{as:v,className:m()(l,y,i&&y+"-"+i,t&&y+"-"+t)}))}));h.defaultProps=g,h.displayName="ListGroup",h.Item=y;var j=h,x=t("3Z9Z"),O=t("JI6e");function N(e){return n.a.createElement("div",null,n.a.createElement(x.a,null,n.a.createElement(O.a,{sm:2},n.a.createElement("b",null,e.title)),n.a.createElement(O.a,null,e.location)),n.a.createElement(x.a,null,n.a.createElement(O.a,{sm:2},e.company),n.a.createElement(O.a,null,e.date)))}function P(){return n.a.createElement("div",null,n.a.createElement("link",{rel:"stylesheet",href:"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",integrity:"sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk",crossorigin:"anonymous"}),n.a.createElement(l.a,{items:["Blog","Resume","Projects"],links:["/","/resume","/projects"],projects:["Ultra Stack","Shaders","Puzzle Game","IK Demos","Spline Editor"]}),n.a.createElement("br",null),n.a.createElement(c.a,{fluid:!0},n.a.createElement(j,{variant:"flush"},n.a.createElement(j.Item,null,n.a.createElement("h3",null,"Education"),n.a.createElement("b",null,"Swarthmore College, Class of 2020"),n.a.createElement("p",null,"BA Computer Science, Minor in Film & Media Studies")),n.a.createElement(j.Item,null,n.a.createElement("h3",null,"Professional Experience"),n.a.createElement(N,{title:"Associate Software Engineer",location:"Melbourne, FL",date:"July 2020 - Present",company:"Northrop Grumman"}),n.a.createElement("p",null,n.a.createElement("br",null),n.a.createElement("i",null,"(C++, Python, Atlassian Tools, Git)")," ",n.a.createElement("br",null),"• Developed infrastructure services in C++ for an Aeronautics Systems project ",n.a.createElement("br",null),"• Resolved static analysis warnings (memory leaks, implicit casting, etc) ",n.a.createElement("br",null),"• Designed, executed, and analyzed test procedures ",n.a.createElement("br",null),"• Developed automation tools and scripts using Python ",n.a.createElement("br",null)),n.a.createElement("br",null),n.a.createElement(N,{title:"Game Developer Intern",location:"Falls Church, VA",date:"June 2019 - October 2019",company:"Northrop Grumman"}),n.a.createElement("p",null,n.a.createElement("br",null),n.a.createElement("i",null,"(.NET, C#, Unity3D, Git, Team Foundation Server)")," ",n.a.createElement("br",null),"• Developed an existing training board game into a multiplayer/online game",n.a.createElement("br",null),"• Designed and programmed a C# Async Windows server with a custom protocol to support multiplayer",n.a.createElement("br",null),"• Designed and programmed the game’s UI/UX using C# and Unity3D",n.a.createElement("br",null),"• Programmed multiplayer turn-based gameplay mechanics (trading system, resource management, social chat system)",n.a.createElement("br",null),"• Designed and developed a Bootstrap website using HTML5, CSS, and Javascript",n.a.createElement("br",null))))),n.a.createElement("br",null))}},JI6e:function(e,a,t){"use strict";var r=t("wx14"),n=t("zLVn"),l=t("TSYQ"),c=t.n(l),s=t("q1tI"),o=t.n(s),i=t("vUet"),m=["xl","lg","md","sm","xs"],u=o.a.forwardRef((function(e,a){var t=e.bsPrefix,l=e.className,s=e.as,u=void 0===s?"div":s,d=Object(n.a)(e,["bsPrefix","className","as"]),b=Object(i.a)(t,"col"),f=[],p=[];return m.forEach((function(e){var a,t,r,n=d[e];if(delete d[e],"object"==typeof n&&null!=n){var l=n.span;a=void 0===l||l,t=n.offset,r=n.order}else a=n;var c="xs"!==e?"-"+e:"";a&&f.push(!0===a?""+b+c:""+b+c+"-"+a),null!=r&&p.push("order"+c+"-"+r),null!=t&&p.push("offset"+c+"-"+t)})),f.length||f.push(b),o.a.createElement(u,Object(r.a)({},d,{ref:a,className:c.a.apply(void 0,[l].concat(f,p))}))}));u.displayName="Col",a.a=u},M29Y:function(e,a,t){"use strict";t.d(a,"a",(function(){return c}));var r=t("q1tI"),n=t.n(r),l=t("6xyR");function c(e){return n.a.createElement(l.a,null,n.a.createElement(l.a.Header,null,e.date),n.a.createElement(l.a.Body,null,n.a.createElement(l.a.Title,null,e.title),n.a.createElement(l.a.Text,null,e.body)))}}}]);
//# sourceMappingURL=component---src-pages-resume-js-fb96309b620b676e7e8d.js.map