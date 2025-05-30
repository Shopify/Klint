#!/bin/bash

################################################################
################################################################
# Welcome to the Shopify Docusaurus Installer Script.
#
# To use this please make a copy of this file in the root
# of your repo, then in the terminal run:
# /bin/bash shopify_docusaurus_installer.sh
#
# If you encounter any issues please reach out in
# #help-microsites in Slack
#
# Once the installer has completed you will still have
# to make some minor edits to the docusaurus.config.js and the
# microsite.yml file to complete your setup.
# Please refer to the the guide in the Development Handbook:
# https://development.shopify.io/engineering/keytech/apidocs/microsites/docusaurus
################################################################
################################################################


#################
# SCRIPT STEPS:
#
# 1. npx install
# 2. clean up
# 3. create dev.yml
# 4. dev up
# 5. update gitignore
# 6. install theme & local search
# 7. update config
# 8. update sidebars.js
# 9. add example content
# 10. dev up && yarn install to complete install process
# 11. check/create microsite.yml
# 12. create & populate .spin folder
# End of count
# 00. finish (inc. remove script file)
#
################################################################
################################################################

### VARIABLES

# Colour variables
LIGHTGRAY='\033[0;37m'
GRAY='\033[0;90m'
LIGHTRED='\033[0;91m'
LIGHTGREEN='\033[0;92m'
LIGHTYELLOW='\033[0;93m'
LIGHTBLUE='\033[0;94m'
LIGHTMAGENTA='\033[0;95m'
LIGHTCYAN='\033[0;96m'
WHITE='\033[0;97m'
ENDCOLOR='\033[00m'

# Prints success/failure message after each process
SUCCESS="✅ ${LIGHTGREEN}Process completed successfully!${ENDCOLOR}\n"
FAILURE="⛔️ ${LIGHTRED}This step was unsuccessful, please make a note of it and reach out in #help-microsites for assistance${ENDCOLOR}\n"

# Tracks progress
PROGRESS=0
TOTALSTEPS=12

# Other variables definied below in the functions:
# $REPO
# $BRANCH

# Part of the microsite_yml function below
# checks repo dir for existing microsite.yml
# FILE_LOCATION=$(find_file)


################################################################
################################################################


### FUCNTIONS:

# Loads dev for the script
load_dev () {
  if [[ -f /opt/dev/dev.sh ]]; then
    source /opt/dev/dev.sh
  fi
}

# Checks for existing 'docs' directory and updates
# the name to avoid potantial conflicts with the installer
handle_old_content () {
  if [ -d "docs" ] || [ -d "Docs" ]
  then
      mv docs previousMicrosite
      echo -e "📄 ${LIGHTRED}Updated ${LIGHTCYAN}'docs' ${LIGHTRED}directory to${ENDCOLOR} ${LIGHTCYAN}'previousMicrosite'${ENDCOLOR}${LIGHTRED}.${ENDCOLOR}"
      echo -e "${LIGHTRED}See here for your old site contents.${ENDCOLOR}"
  fi
}

# For new repos, will look inside the .shopify-build dir for the build file
# created with the spy command and update it
# If no file present, or if the file contents don't match it will prompt the user to
# confirm if they wish to continue.
# If the folder is not present it will exit the installer with a message to complete
# this step first.
check_build () {

BUILDFILE=$(cat <<'BUILDTEXT'
containers:
  docs_container:
    docker: gcr.io/shopify-docker-images/apps/production/apidocs-generator-alpine:production

steps:
  - label: Assemble docs
    git:
      history: shallow
    timeout: 5m
    run:
      - cd /projects/api-node && ./assemble --type=docs --microsite-root=/docusaurus
    container: docs_container
BUILDTEXT
)

NO_BUILDFILE=$(cat << MESSAGE
${LIGHTYELLOW}It seems you either:
    a. Already have a custom build pipeline file
    b. Don't have a new build pipeline file present

- If this is 'a' please refer to the migration Docusaurus guide for the updated file contents and enter 'yes' to continue the installer.

- If 'b', please refer to the Docusaurus guide and complete the pipline setup step prior to running the installer and press 'enter' to quit the installer.'${ENDCOLOR}
MESSAGE
)

    echo -e "${LIGHTYELLOW}Checking to ensure there is a new build pipeline file.\nPlease follow any prompts if presented.\n${ENDCOLOR}"

    if [ -d ".shopify-build" ]
    then
        cd .shopify-build

        # declare string to search for
        FIND='echo "Hello World"'
        # assign file name to var
        FILE=$(grep -lr "$FIND" .)

        if [ -s "$FILE" ]
        then
            echo -e "${LIGHTYELLOW}Updating new build pipeline file for Docusaurus:${ENDCOLOR} ${LIGHTCYAN}$FILE${ENDCOLOR}"
            echo -e "$BUILDFILE" > $FILE
        else
            echo -e "${LIGHTRED}\nNew buildfile 404:\n\n$NO_BUILDFILE${ENDCOLOR}"
            read -r -p ">>> " build_choice
            if [[ "$build_choice" =~ "yes" ]] || [[ "$build_choice" =~ "Yes" ]] || [[ "$build_choice" =~ "y" ]]
            then
                echo -e "${LIGHTYELLOW}Continuing installer...${ENDCOLOR}"
            else
                exit 1
            fi
        fi
    else
        echo -e "${LIGHTRED}\nIt seems you don't have a .shopify-build folder present.\nPlease refer to the Docusaurus guide and run the Spy command first.\nFollowing that run the installer again\nIf you feel this message was presented in error please reach out in the ${LIGHTCYAN}#help-microsites${ENDCOLOR}${LIGHTRED} channel in Slack."${ENDCOLOR}
        exit 1
    fi
    cd ..
}

# Checks to see if there is a folder called docusaurus already if
# found renames to prevent naming collision with the install command
ensure_install_location_available () {
  if [ -d "docusaurus" ] || [ -d "Docusaurus" ]
  then
      mv docusaurus oldDocusaurus
      echo -e "📄 ${LIGHTRED}Updated ${LIGHTCYAN}'docusaurus'${ENDCOLOR} ${LIGHTRED}directory to${ENDCOLOR} ${LIGHTCYAN}'oldDocusaurus'${ENDCOLOR}${LIGHTRED}.${ENDCOLOR}"
      echo -e "${LIGHTRED}See here for your old site contents.${ENDCOLOR}"
  fi
}

# Checks to see if there is a folder called .spin already if
# found renames to prevent naming collision with the install command
ensure_spin_folder_available () {
  if [ -d ".spin" ]
  then
      mv .spin .oldSpin
      echo -e "📄 ${LIGHTRED}Updated ${LIGHTCYAN}'.spin'${ENDCOLOR} ${LIGHTRED}directory to${ENDCOLOR} ${LIGHTCYAN}'.oldSpin'${ENDCOLOR}${LIGHTRED}.${ENDCOLOR}"
      echo -e "${LIGHTRED}See here for your old site contents.${ENDCOLOR}"
  fi
}

# Requests user input to define the repo name
repo_name () {
    echo -e "\nPlease enter your repo name ${LIGHTRED}EXACTLY${ENDCOLOR} as it appears in GitHub:"
    read -r -p ">>> " REPO
}

# Requests user input to define the default branch for their repo
branch_check () {
    echo -e "\nWhat is the name of your default branch ${LIGHTRED}EXACTLY${ENDCOLOR} as it appears in GitHub?"
    echo -e "You can choose \`1\` for \`main\`, or \`2\` for \`master\`. Else enter \`3\` to manually type your branch name."
    echo -e "Enter:\n"
    cat << EOF
        1. main
        2. master
        3. (manual input option):

EOF
    read -r -p ">>> " reply
    if  [[ "$reply" =~ "1" ]]
    then
        BRANCH="main"
    elif [[ "$reply" =~ "2" ]]
    then
        BRANCH="master"
    else
        echo "Please type the default branch name for your repo:"
        read -r -p ">>> " choice
        BRANCH="$choice"
    fi
}

# Prints the repo and default branch from the user
# and prompts them to confirm before proceeding
installer_start () {
    repo_name
    branch_check
    echo -e "\nThank you, currently you have choosen:\n"
    echo -e "\tRepo name:   ${LIGHTCYAN}$REPO${ENDCOLOR}"
    echo -e "\tBranch name: ${LIGHTCYAN}$BRANCH${ENDCOLOR}"
    echo -e "\n${LIGHTYELLOW}Please enter 1 to confirm, or 2 to re-enter details:${ENDCOLOR}"
    read -r -p ">>> " confirmation
        if  [[ "$confirmation" =~ "1"  ]]
        then
            echo -e "\n${LIGHTGREEN}Thank you for confirming, install continuing...${ENDCOLOR}\n"
        else
            installer_start
        fi
}

# Checks the return value of last run command
# 0 == success, 1..127 == failure
check_success () {
    if [ $? == 0 ]
    then
        echo -e $SUCCESS
        ((PROGRESS++))
        echo -e "⏳ ${GRAY}$PROGRESS/$TOTALSTEPS steps done.${ENDCOLOR}\n"
    else
        echo -e $FAILURE
        ((PROGRESS++))
        echo -e "⏳ ${GRAY}$PROGRESS/$TOTALSTEPS steps done.${ENDCOLOR}\n"
        read -p "Press any key to continue the installation..."
    fi
}

# Checks if a README.md exists at repo root, if none found creates one
# and includes a link to the handbook article on best readme's
check_read_me_exists () {
  if [ -s "README.md" ]
  then
    echo
  else
    touch README.md
    cat << 'README' >> README.md
    ## Be sure to check out the README template in the Development Handbook [HERE](https://development.shopify.io/engineering/overview/culture/knowledge/readmes)!
README
  fi
}

# Checks if the autolink workflow for the tophat link exists
# if not found will create
check_auto_link_exists () {
  if  [ -s ".github/workflows/autolink.yml" ]
  then
    echo
  else
    # `&>/dev/null` to suppress 'mkdir * already exists' message if folders are already present
    mkdir .github .github/workflows &>/dev/null && touch .github/workflows/autolink.yml
    cat << AUTOLINK >> .github/workflows/autolink.yml
name: Documentation Link
on:
  pull_request:
    types: [opened, ready_for_review]
    paths:
      - 'docusaurus/**'
    branches-ignore:
      - 'dependabot/**'

jobs:
  comment:
    name: Comment
    runs-on: shopify-ubuntu-latest
    permissions:
      pull-requests: write
    env:
      branch: \${{ github.head_ref || github.ref_name }}
    steps:
      - name: Branch to lower
        shell: bash
        run: echo "branch_lower=\$(echo \${{ env.branch }} | tr '[:upper:]' '[:lower:]')" >> \$GITHUB_ENV

      - name: Sanitise branch name
        shell: bash
        run: echo "branch_sanitised=\$(echo \${{ env.branch_lower }} | sed 's/[^A-Za-z0-9-]/-/g')" >> \$GITHUB_ENV

      - name: Truncate branch
        shell: bash
        run: echo "branch_truncated=\$(echo \${{ env.branch_sanitised }} | cut -c 1-30)" >> \$GITHUB_ENV

      - name: Trim hyphens
        shell: bash
        run: echo "branch_trimmed=\$(echo \${{ env.branch_truncated }} | sed 's/^-*\|-*$//g')" >> \$GITHUB_ENV

      - name: Comment on PR
        uses: Shopify/github-actions/comment-on-pr-action@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          msg: ':tophat: This PR can be tophatted on https://\${{ github.event.repository.name }}--\${{ env.branch_trimmed }}.docs.shopify.io/ once the CI completes.'
          check_for_duplicate_msg: true
AUTOLINK
  fi
}

microsite_yml () {
  cd ..
  FILE_LOCATION=$(find . -type f -name "microsite.yml" 2>/dev/null | head -n 1)
  if [ -s "$FILE_LOCATION" ]
  then
      echo -e "🔍 ${LIGHTYELLOW}\`microsite.yml\` file found at:${ENDCOLOR} ${LIGHTCYAN}$FILE_LOCATION${ENDCOLOR}"
      echo -e "🚚 ${LIGHTYELLOW}Moving to \`docusaurus/\` directory...${ENDCOLOR}\n"
      mv $FILE_LOCATION docusaurus/microsite.yml
      check_success
  else
      echo -e "📝 ${LIGHTYELLOW}Creating \`microsite.yml\`...${ENDCOLOR}\n"
      cd docusaurus
      touch microsite.yml
      cat << MICROSITE >> microsite.yml
# Please do not remove this file as it is required to populate the \`catalog.docs.shopify.io\` page

# Modify 'title'
title: My Title

# Modify 'description'
description: >
  A brief description of the purpose of your microsite or it's content.

repository:
  home: https://github.com/Shopify/$REPO
  branch: $BRANCH
  blob_url: "%home%/blob/%branch%/%path%"
MICROSITE
      check_success
  fi
}

################################################################
################################################################


### BEGIN INSTALLATION

echo -e "${LIGHTYELLOW}You are about to install Docusaurus, press 'Enter' to continue, or press 'CTRL+C' to abort.${ENDCOLOR}"
echo -e "${LIGHTYELLOW}If you have not yet viewed the documentation please do so at \`https://development.shopify.io/engineering/keytech/apidocs/microsites/docusaurus\` before proceededing.${ENDCOLOR}"
echo -e "${LIGHTYELLOW}If you require assistance please reach out in \`#help-microsites\` in Slack.${ENDCOLOR}"
read -p ">>> "

echo -e "\n🦖 ${LIGHTYELLOW}Running Shopify Docusaurus Installer...${ENDCOLOR}\n"

# Run pre-installation functions
# See functions section above for descriptions
installer_start
check_build
load_dev
check_read_me_exists
handle_old_content
ensure_install_location_available
ensure_spin_folder_available
check_auto_link_exists

### Step 1
# Runs Docusaurus installer and moves into the new directory
npx create-docusaurus@latest docusaurus classic
cd docusaurus
check_success

### Step 2
# Cleans up unneeded files from the installation
echo -e "🧹 ${LIGHTYELLOW}Running post install clean up process...${ENDCOLOR}\n"
rm -r "./blog" "./docs/" "./node_modules" "./package-lock.json" "./src/" "./README.md"
check_success

### Step 3
# Creates and populates the dev.yml
echo -e "👩‍💻 ${LIGHTYELLOW}Creating \`dev.yml\`...${ENDCOLOR}\n"
touch dev.yml
cat << DEV >> dev.yml
name: $REPO
up:
  - node:
      version: v20.11.1
      yarn: 1.22.15

server:
  desc: Run docusaurus documentation local server
  run: yarn run start --no-open

build:
  desc: build and serve the static website
  run: |
    yarn run build
    yarn run serve

open:
  app: http://localhost:3000
DEV
check_success

### Step 4
# Run dev up
echo -e "💻 ${LIGHTYELLOW}Running \`dev up\`...${ENDCOLOR}\n"
dev up
check_success

### Step 5
# Adds `.dev` folder to .gitignore
echo -e "📝 ${LIGHTYELLOW}Updating \`.gitignore\`...${ENDCOLOR}\n"
echo -e "\n# Shopify\n.dev" >> .gitignore
check_success

### Step 6
# Install the Shopify Docusaurus theme and local search
echo -e "🏞  ${LIGHTYELLOW}Installing Shopify theme and 🔍 local search...${ENDCOLOR}\n"
yarn add @shopify/docusaurus-shopify-theme @shopify/docusaurus-docuchat @easyops-cn/docusaurus-search-local
check_success

### Step 7
# Repopulates the docusaurus.config.js file with the required details
# Will still require some user editing at the end
echo -e "📝 ${LIGHTYELLOW}Updating \`docusaurus.config.js\`...${ENDCOLOR}\n"
cat << CONFIG > docusaurus.config.js
module.exports = {
  title: 'My Title',
  tagline: 'A brief description of the purpose of your microsite or it\'s content.',
  url: 'https://$REPO.docs.shopify.io',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Shopify',
  projectName: '$REPO',
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ['ruby', 'sql'],
    },
    navbar: {
      title: 'My Title',
      items: [
        {
          href: 'https://github.com/shopify/$REPO',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Microsite Docs',
          items: [
            {
              label: 'Microsite Docs',
              to: 'https://development.shopify.io/engineering/keytech/apidocs/microsites',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/shopify/$REPO',
            },
          ],
        },
      ],
      copyright: \`Copyright © \${new Date().getFullYear()} Shopify Inc.\`,
    },
  },
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: 'docs',
        indexPages: true,
        docsRouteBasePath: '/',
      }
    ]
  ],
  themes: ['@shopify/docusaurus-shopify-theme', '@shopify/docusaurus-docuchat'],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/shopify/$REPO/edit/$BRANCH/docusaurus/',
        },
        blog: false,
        pages: false,
        sitemap: false,
      },
    ],
  ],
};
CONFIG
check_success

### Step 8
# Updating `sidebars.js` to recommended method
echo -e "📝 ${LIGHTYELLOW}Updating \`sidebars.js\`...${ENDCOLOR}\n"
cat << SIDEBARS > sidebars.js
module.exports = {

  // This for the alphabetical autogenerated sidebar
  autoSidebar: [{type: 'autogenerated', dirName: '.'}],

  // Uncomment this if not using the auto sidebar above
  // Uses the docusaurus/docs directory by default as the root of the docs

  // This is an example of what the manual sidebar should look like
  /*
  docs: [
    'introduction',
    {
      type: 'category',
      label: 'Navigation',
      collapsible: true,
      collapsed: true,
      // Add these as an array
      items: [
        'nav/nav',
        'nav/text'
      ],
    },
  ],
  */

};

SIDEBARS
check_success

### Step 9
# Creates the `docs` & `docs/nav` folders to hold the example pages for the site
# Creates the `index.md`, `nav/nav.md`, `nav/text.md` to get users started
echo -e "📝 ${LIGHTYELLOW}Adding example pages...${ENDCOLOR}\n"
mkdir docs && touch docs/index.md
cat << 'INDEX' >> docs/index.md
---
id: introduction
title: Introduction
slug: /
---
(I can be deleted/replaced with your content)
# Tutorial Intro

Let's discover **Docusaurus in less than 5 minutes**.

## Getting Started

Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[new.docusaurus.io](https://new.docusaurus.io)**.

## Start your site

Run the development server:

```shell
cd docusaurus && dev up && dev server
```

Your site starts at `http://localhost:3000`.

Open `docusaurus/docs/index.md` and edit some lines, the site **reloads automatically** and displays your changes.

If you have an existing microsite move the pages from the `previousMicrosite` directory to `docusaurus/docs/`.
For more information about migrating from a Jekyll to a Docusaurus microsite please refer to the [documentation](https://development.shopify.io/engineering/keytech/apidocs/microsites/docusaurus-migration).
INDEX

mkdir docs/nav && touch docs/nav/nav.md
cat << 'NAV' >> docs/nav/nav.md
---
id: nav
title: Customising your navigation sidebar
---
(I can be deleted/replaced with your content)

# Editing your sidebar

See the [official documentation](https://docusaurus.io/docs/sidebar) for the full information.

There are the following options for editing your sidebar.

1. [Creating your own sidebar](https://docusaurus.io/docs/sidebar#sidebar-object) and defining the categories and order there. **(Recommended)**
2. [Autogenerated alphabetically](https://docusaurus.io/docs/sidebar#sidebar-object) from the directory and file structure.
3. Defining display order in the [front matter/metadatas](https://docusaurus.io/docs/sidebar#autogenerated-sidebar-metadatas).
4. Defining display with a [filename prefix](https://docusaurus.io/docs/sidebar#using-number-prefixes).
NAV

touch docs/nav/text.md
cat << 'TEXT' >> docs/nav/text.md
---
id: text
title: Just an extra page
---
(I can be deleted/replaced with your content)

#### Just an additional page for the sidebar example

TEXT
check_success

### Step 10
# Runs `dev up` and `yarn install` to get users ready for local development
echo -e "💻 ${LIGHTYELLOW}Running \`dev up\`, \`yarn install\`, and \`yarn upgrade\`...${ENDCOLOR}\n"
dev up && yarn install && yarn upgrade && dev up
check_success

### Step 11
# Creates and populates the `microsite.yml` if non found
# else will move an existing file to the new directory
microsite_yml

echo -e "\n\n🎉 ${LIGHTGREEN}Install complete!${ENDCOLOR} 🥳\n"

echo -e "${LIGHTCYAN}For more information you can view the documentation at \`https://development.shopify.io/engineering/keytech/apidocs/microsites/docusaurus\` which will guide your through the remaining steps.${ENDCOLOR}\n"
echo -e "${LIGHTCYAN}If you require any assistance please reach out in \`#help-microsites\` in Slack.${ENDCOLOR}"

echo -e "\nTo run this locally now, enter ${LIGHTYELLOW}\`cd docusaurus && dev up && dev server\`${ENDCOLOR} in the terminal prompt.\n"

### Step 12
# Creates and populates the .spin folder
echo -e "👩‍💻 ${LIGHTYELLOW}Creating \`.spin\` folder...${ENDCOLOR}\n"
mkdir ../.spin
cat << SPIN >> ../.spin/Procfile
server: cd docusaurus && yarn run start --no-open --port \$PORT --host 0.0.0.0 --hot-only
SPIN
cat << SPIN >> ../.spin/bootstrap
#!/bin/bash

cd docusaurus && yarn install
SPIN
cat << SPIN >> ../.spin/nginx.conf.erb
server {
  listen 80;
  server_name <%= fqdn %>;
  rewrite ^ https://\$host\$request_uri? permanent;
}

server {
  listen 443 ssl;
  server_name <%= fqdn %>;

  access_log <%= access_log %>;
  error_log <%= error_log %>;

  ssl_certificate <%= ssl_certificate %>;
  ssl_certificate_key <%= ssl_certificate_key %>;

  # require headers for http proxy
  proxy_set_header Client-IP         \$remote_addr;
  proxy_set_header X-Real-IP         \$remote_addr;
  proxy_set_header X-Forwarded-For   \$remote_addr;
  proxy_set_header Host              \$http_host;
  proxy_set_header X-Forwarded-Proto \$scheme;
  proxy_set_header X-Forwarded-Port  \$server_port;
  proxy_set_header Upgrade           \$http_upgrade;
  proxy_set_header Connection        \$http_connection;

  proxy_http_version 1.1;
  proxy_redirect off;
  proxy_next_upstream off;
  proxy_read_timeout 30m;

  location /webpack {
    proxy_pass http://127.0.0.1:<%= ENV.fetch("REACT_ASSET_SERVER_PORT", 8080) %>;
  }

  location / {
    # Buffer settings suggested in https://andrewlock.net/fixing-nginx-upstream-sent-too-big-header-error-when-running-an-ingress-controller-in-kubernetes/
    # Without this, very large cookie headers (generated by the auth flow) cause nginx to 502, even when an otherwise valid response is
    # available.
    proxy_buffers         8 16k;
    proxy_buffer_size     16k;
    proxy_pass http://127.0.0.1:<%= ENV.fetch("PORT", 3000) %>;
  }
}
SPIN
cat << SPIN >> ../.spin/node.yml
node: 20.11.1
SPIN
cat << SPIN >> ../.spin/tools.yml.erb
# The UI section defines things intended to be integrated into various user interfacing tools
ui:
  # URLs displayed in tools like the Spin VSCode and Chrome extensions
  urls:
  - label: Docs
    url: https://$REPO.<%= @fqdn %>
SPIN
cat << SPIN >> ../.spin/update
#!/bin/bash

cd docusaurus && yarn install
SPIN
chmod a+x ../.spin/bootstrap
check_success

# Remove installer script and open internal docs
rm shopify_docusaurus_installer.sh
