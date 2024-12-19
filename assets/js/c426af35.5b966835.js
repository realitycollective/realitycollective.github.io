"use strict";(self.webpackChunkreality_toolkit_docs=self.webpackChunkreality_toolkit_docs||[]).push([[369],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var o=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=o.createContext({}),c=function(e){var t=o.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=c(e.components);return o.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},d=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=c(n),m=r,h=d["".concat(s,".").concat(m)]||d[m]||p[m]||i;return n?o.createElement(h,a(a({ref:t},u),{},{components:n})):o.createElement(h,a({ref:t},u))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,a[1]=l;for(var c=2;c<i;c++)a[c]=n[c];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8117:function(e,t,n){n.r(t),n.d(t,{contentTitle:function(){return s},default:function(){return d},frontMatter:function(){return l},metadata:function(){return c},toc:function(){return u}});var o=n(7462),r=n(3366),i=(n(7294),n(3905)),a=["components"],l={title:"Contribution",description:"How to contribute",hide_table_of_contents:!0},s="Contributing to the Reality Collective",c={type:"mdx",permalink:"/contribution",source:"@site/src/pages/contribution.md",title:"Contribution",description:"How to contribute",frontMatter:{title:"Contribution",description:"How to contribute",hide_table_of_contents:!0}},u=[{value:"How To Contribute",id:"how-to-contribute",level:2},{value:"Quick Guidelines",id:"quick-guidelines",level:2},{value:"Licensing",id:"licensing",level:2},{value:"Need More Help?",id:"need-more-help",level:2}],p={toc:u};function d(e){var t=e.components,n=(0,r.Z)(e,a);return(0,i.kt)("wrapper",(0,o.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"contributing-to-the-reality-collective"},"Contributing to the Reality Collective"),(0,i.kt)("p",null,"We are happy that you have chosen to contribute to the Reality Collective and its projects, we are a trully open community and support any contributions small or large. This simple guide was written to guide you throug the steps to contirbute code."),(0,i.kt)("p",null,"Alternatively, you can choose to support the Reality Collective and it's projects though GitHub sponsors (other options coming soon)."),(0,i.kt)("p",null,"Please read this document completely before contributing."),(0,i.kt)("h2",{id:"how-to-contribute"},"How To Contribute"),(0,i.kt)("p",null,"All Reality Collective projects have ",(0,i.kt)("inlineCode",{parentName:"p"},"development")," branch for daily development, released packages also have a ",(0,i.kt)("inlineCode",{parentName:"p"},"Main")," branch for the current active release.  New features and fixes are always submitted to the ",(0,i.kt)("inlineCode",{parentName:"p"},"development")," branch."),(0,i.kt)("p",null,'If you are looking for ways to help, you should start by looking at the "Help Wanted tasks" in each project, for example in the ',(0,i.kt)("a",{parentName:"p",href:"https://github.com/realitycollective/com.realitycollective.service-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22Help+Wanted%22"},"Service Framework"),".  Please let us know if you plan to work on an issue so that others are not duplicating your work."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"!! An Issue should proceed any PR to outline the change (Unless it is minor or a documentation update), whether it is an actual bug report, a proposal for correction, or additional functionality.")),(0,i.kt)("p",null,"The Reality Collective projects follow the standards ",(0,i.kt)("a",{parentName:"p",href:"https://guides.github.com/introduction/flow/index.html"},"GitHub flow"),".  You should learn and be familiar with how to ",(0,i.kt)("a",{parentName:"p",href:"https://help.github.com/articles/set-up-git/"},"use Git"),", how to ",(0,i.kt)("a",{parentName:"p",href:"https://help.github.com/articles/fork-a-repo/"},"create a fork of any Reality Collective project"),", and how to ",(0,i.kt)("a",{parentName:"p",href:"https://help.github.com/articles/using-pull-requests/"},"submit a Pull Request"),"."),(0,i.kt)("p",null,"After you submit a PR, the ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/realitycollective/com.realitycollective.service-framework/actions/"},"Reality Collective build servers")," will build your changes and verify that all tests pass (CHeck the ",(0,i.kt)("inlineCode",{parentName:"p"},"Actions")," tab for the respective project).  Project maintainers and contributors will review your changes and provide constructive feedback to improve your submission."),(0,i.kt)("p",null,"Once we are satisfied that your changes are good, we will merge your PR."),(0,i.kt)("h2",{id:"quick-guidelines"},"Quick Guidelines"),(0,i.kt)("p",null,"Here are a few simple rules and suggestions to remember when contributing to any Reality Collective project."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"\u203c\ufe0f ",(0,i.kt)("strong",{parentName:"li"},"NEVER")," commit code that you did not personally write."),(0,i.kt)("li",{parentName:"ul"},"\u203c\ufe0f ",(0,i.kt)("strong",{parentName:"li"},"NEVER")," use decompiler tools to steal code and submit it as your own work."),(0,i.kt)("li",{parentName:"ul"},"\u203c\ufe0f ",(0,i.kt)("strong",{parentName:"li"},"NEVER")," decompile XNA assemblies and steal Microsoft's copyrighted code."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"PLEASE")," try to keep your PRs focused on a single topic and of a reasonable size or we may ask you to break it up."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"PLEASE")," be sure to write simple and descriptive commit messages."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO NOT")," surprise us with new APIs or big new features. Open an issue to discuss your ideas first."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO NOT")," reorder type members as it makes it difficult to compare code changes in a PR."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO")," try to follow our coding style ",(0,i.kt)("inlineCode",{parentName:"li"},"CODESTYLE.md")," for new code."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO")," give priority to the existing style of the file you are changing."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO")," try to add to our ",(0,i.kt)("inlineCode",{parentName:"li"},"unit tests")," when adding new features or fixing bugs."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"DO NOT")," send PRs for code style changes or make code changes just for the sake of style."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"PLEASE")," keep a civil and respectful tone when discussing and reviewing contributions."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("strong",{parentName:"li"},"PLEASE")," tell others about the Reality Collective and your contributions via social media.")),(0,i.kt)("h2",{id:"licensing"},"Licensing"),(0,i.kt)("p",null,"Reality Collective projects are under the ",(0,i.kt)("a",{parentName:"p",href:"https://opensource.org/licenses/MS-PL"},"Microsoft Public License"),".  See the ",(0,i.kt)("inlineCode",{parentName:"p"},"LICENSE.txt")," file for more details."),(0,i.kt)("p",null,'We accept contributions in "good faith" that it is not bound to a conflicting license.  By submitting a PR you agree to distribute your work under the Reality Collective license and copyright.'),(0,i.kt)("p",null,"To this end, when submitting new files, include the following in the header if appropriate:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-csharp"},"\ufeff// Copyright (c) Reality Collective. All rights reserved.\n// Licensed under the MIT License. See LICENSE in the project root for license information.\n")),(0,i.kt)("h2",{id:"need-more-help"},"Need More Help?"),(0,i.kt)("p",null,"If you need help, please ask questions on our ",(0,i.kt)("a",{parentName:"p",href:"https://discord.gg/YjHAQD2XT8"},"Discord")," or raise issues in each respective project."),(0,i.kt)("p",null,"Thanks for reading this guide and helping make XR Development great!"),(0,i.kt)("p",null," \u2764\ufe0f The Reality Collective"))}d.isMDXComponent=!0}}]);