"use strict";(self.webpackChunkreality_toolkit_docs=self.webpackChunkreality_toolkit_docs||[]).push([[477],{10:function(e){e.exports=JSON.parse('{"blogPosts":[{"id":"welcome","metadata":{"permalink":"/blog/welcome","editUrl":"https://github.com/realitycollective/realitycollective.github.io/edit/development/blog/2022-05-24-welcome.md","source":"@site/blog/2022-05-24-welcome.md","title":"Welcome to our new docs page!","description":"Our official documentation page","date":"2022-05-24T00:00:00.000Z","formattedDate":"May 24, 2022","tags":[{"label":"welcome","permalink":"/blog/tags/welcome"},{"label":"reality","permalink":"/blog/tags/reality"},{"label":"toolkit","permalink":"/blog/tags/toolkit"}],"readingTime":0.47,"truncated":false,"authors":[{"name":"Simon (Darkside) Jackson","title":"Resolving life, one day and build at a time","url":"https://github.com/SimonDarksideJ","imageURL":"https://github.com/SimonDarksideJ.png","key":"simon"},{"name":"Rony Portelli","title":"xRealityLabs","url":"https://github.com/Cangi","imageURL":"https://github.com/Cangi.png","key":"rony"},{"name":"Dino Fejzagi\u0107","title":"Senior XR Engineer, CTO CodeEffect","url":"https://github.com/FejZa","imageURL":"https://github.com/FejZa.png","key":"dino"}],"frontMatter":{"slug":"welcome","title":"Welcome to our new docs page!","authors":["simon","rony","dino"],"tags":["welcome","reality","toolkit"]},"nextItem":{"title":"Using the Reality Toolkit project generator for new packages","permalink":"/blog/project-template"}},"content":"## Our official documentation page\\n\\nHey and welcome to the brand new Reality Toolkit docs page. On this page you will find useful links and most importantly user documentation for the toolkit\'s features. Please bare with us as we prepare initial content.\\n\\nWe\'ll be using this blog for release announcements and whatever we feel like is important enough to ring the bell.\\n\\n## Discord\\n\\nWe have a started a community [Discord](https://discord.gg/YjHAQD2XT8) server for the toolkit. If you have not joined yet, do so and join a great commuity of XR enthusiasts just like yourself!"},{"id":"project-template","metadata":{"permalink":"/blog/project-template","editUrl":"https://github.com/realitycollective/realitycollective.github.io/edit/development/blog/2022-03-13-using-project-template-generator/index.md","source":"@site/blog/2022-03-13-using-project-template-generator/index.md","title":"Using the Reality Toolkit project generator for new packages","description":"To generate a new project for the Reality Toolkit, we have provided a handy repository generator that includes everything you need to get started.","date":"2022-03-13T00:00:00.000Z","formattedDate":"March 13, 2022","tags":[{"label":"upm","permalink":"/blog/tags/upm"},{"label":"reality","permalink":"/blog/tags/reality"},{"label":"toolkit","permalink":"/blog/tags/toolkit"}],"readingTime":3.785,"truncated":false,"authors":[{"name":"Simon (Darkside) Jackson","title":"Resolving life, one day and build at a time","url":"https://github.com/SimonDarksideJ","imageURL":"https://github.com/SimonDarksideJ.png","key":"simon"}],"frontMatter":{"slug":"project-template","title":"Using the Reality Toolkit project generator for new packages","authors":["simon"],"tags":["upm","reality","toolkit"]},"prevItem":{"title":"Welcome to our new docs page!","permalink":"/blog/welcome"}},"content":"To generate a new project for the Reality Toolkit, we have provided a handy repository generator that includes everything you need to get started.\\n\\n> It is possible to reuse the template generator for your own projects that require UPM dependant packages, however, there is additional setup required for your account to enable the automation to work, if required (if not required, then simply delete the \\".github\\" folder)\\n\\nUsing the Template generator is very easy:\\n\\n\\n## 1. Create new Project, using either:\\n\\n* The \\"Use this template\\" button from the \\"*https://github.com/realitycollective/com.realitytoolkit.upm.template*\\" repository \\n    \\n    <br/>\\n\\n    ![use this template button](use-this-template-button.png)\\n\\n    Or\\n\\n* Create a new repository and selecting the \\"*com.realitytoolkit.upm.template*\\" \\"Repository template\\" option\\n    \\n    <br/>\\n\\n    ![create new repository and selecting template](create-repository.png)\\n\\n> Please make sure to select the \\"**include all branches**\\" option before clicking \\"*Create repository*\\"\\n\\n<br/>\\n\\n## 2. Clone project locally as a submodule of \\"RealityToolkit.dev\\" in the \\"Packages\\" folder.\\n\\n```\\n    git submodule add <remote_url> packages\\\\<full project name>\\n```\\n> E.G. \\n> \\n> ```\\n> git submodule add https://github.com/realitycollective/com.realitytoolkit.myawesomeproject.git packages\\\\com.realitytoolkit.myawesomeproject\\n>```\\n\\n## 3. Open powershell window in cloned folder (run powershell if not already in cloned folder)\\n\\nThe \\"*InitializeTemplate*\\" script is a powershell script.  Windows 11 includes powershell by default, so simply run \\"powershell\\" and navigate to the cloned folder, or open a regular \\"command prompt\\" window and navigate to the cloned folder and then run \\"powershell\\".\\n\\n<br/>\\n\\n## 4. Run the command\\n\\n```\\n \\".\\\\InitializeTemplate.ps1 <New Project sub name>\\"\\n```\\n\\nE.G.\\n\\n```\\n    \\".\\\\InitializeTemplate.ps1 myawesomeproject\\"\\n```\\n\\nOnly use the **Name** as everything else is pre-filled in, additional sub names like \\"myawesomeproject.extension\\" are allowed.\\n\\n<br/>\\n\\n## 5. Delete the \\"**InitializeTemplate.ps1**\\" script\\n\\nSimply remove/delete the file from the repository, it is no longer needed after execution.\\n\\n<br/>\\n\\n## 6. Edit \\"package.json\\" and ensure values are correct, add any dependencies as needed.\\n\\nE.G.\\n\\n```\\n    \\"com.realitytoolkit.core\\": \\"1.0.0-preview.1\\"\\n```\\n\\n<br/>\\n\\n## 7. Edit the Build workflow and ensure any dependencies are added to the \\"Run Unit Tests\\" job, remove existing Core default if not required.\\n\\nInside the \\"\\\\.github\\\\workflows\\\\buildupmpackages.yml\\" script, there is a section towards the end named \\"Run Unit Tests\\".  It has a section called \\"dependencies\\" which is pre-filled in with an entry to the RealityToolkit.core project.\\n\\nThe configuration follows a json strructure, so simply add another {key:value} section in the array.  For an example of multiple dependencies, check the configuration in the [SpatialPersistence.asa build file](https://github.com/realitycollective/com.realitytoolkit.spatial-persistence.asa/blob/464fe2f2ecca423ca02ace1955a9a7004cf7b493/.github/workflows/buildupmpackages.yml#L54)\\n\\n> Additional instructions on how this works are included in the [source build pipeline file here](https://github.com/realitycollective/reusableworkflows/blob/73475e0c6c40d1ab142fce0fb2d72a6520a4343e/.github/workflows/rununityunittests.yml#L121)\\n\\nE.G.\\n\\n```\\n    dependencies: \'[{\\"rcdevelopment\\": \\"github.com/realitycollective/com.realitytoolkit.core.git\\"}]\'\\n```\\n\\n**Note*, do not put \\"https://\\" at the beginning of the dependency url.\\n\\n<br/>\\n\\n## 8. Open Unity and ensure all asset/meta files are generated and no additional errors are present.\\n\\nThe template does not include ANY meta files by default, these need to be generated by Unity, to ensure they are unique.\\n\\n<br/>\\n\\n## 9. Check any relevant dependencies for the project are correctly registered in the Package.json dependencies (DO NOT add dependencies to the \\"RealityToolkit.dev\\" project.\\n\\nIn the dependencies section of the \\"package.json\\", ensure any required components are listed.  Check the [\\"com.realitytoolkit.core\\" package.json](https://github.com/realitycollective/com.realitytoolkit.core/blob/rcdevelopment/package.json) for reference\\n\\n<br/>\\n\\n## 10. CLOSE Unity.\\n\\n<br/>\\n\\n## 11. Push changes to the Source repository for the NEW project.\\n\\n<br/>\\n\\n## 12. Check the Build action completes as expected, fix any issues.\\n\\nVisit the \\"Actions\\" tab to see a new \\"job\\" run once the update to the repository has been pushed.  This should automatically be recognized by the build pipeline from the template.\\n\\nIf any issues occur, check the logs and resolve these before continuing.\\n\\n<br/>\\n\\n## 13. Go to the GitHub Repository and validate Repository Settings:\\n\\nGo to the \\"Settings\\" tab for the repository and in the \\"General\\" section, validate the following settings to finalize the repository.\\n\\n    * Un-check ALL features (these are all run from the RealityToolkit.dev repository)\\n    * un-check \\"allow merge commits\\"\\n    * Enable \\"Always suggest updating pull request branches\\"\\n    * Enable \\"Automatically delete head branches\\"\\n\\n![Repository default settings](repository-settings.png)\\n\\n\\n## 15. Go to the GitHub Repository \\"**Branches**\\" section and add branch protections for main, development and feature/*\\n\\n![](branch-settings.png)\\n\\nFor each branch, enable the following settings:\\n\\n    * Require a pull request before merging\\n    * Require approvals\\n    * Dismiss stale pull request approvals when new commits are pushed\\n    * Require status checks to pass before merging\\n    * Require branches to be up to date before merging\\n    * Require conversation resolution before merging\\n\\n![](branch-protections.png)\\n\\n\\n## 16. Once the initial check-in actions are complete, remove all pre-failed Actions runs (to tidy up)\\n\\nThis will deliver a UPM style project, complete with the build pipeline and checks necessary for a platform/service to be built upon."}]}')}}]);