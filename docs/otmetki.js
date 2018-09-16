const nav = document.querySelector('nav');
const header = document.querySelector('header');
const section = document.querySelector('section');
const bookmarksURL = 'bookmarks.json';

fetch(bookmarksURL)
    .then(response => {
        if(!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    })
    .then(bookmarksJson => {
        populateHeader();
        if (!bookmarksJson || !bookmarksJson.children) {
            throw Error('Invalid bookmarksJson format.');
        }
        // bookmarksJson contains multiple bookmark dir contents
        // the second one corresponds to the Bookmark Toolbar
        const bookmarks = bookmarksJson.children[1].children;
        populateBookmarks(bookmarks);
    })
    .catch(error => {
        console.log(error);
    });

function populateHeader() {
    let heading = document.createElement('h2');
    heading.textContent = 'Bookmarks';
    header.appendChild(heading);
}

function populateBookmarks(bookmarks) {
    let bmElem = document.createElement('h3');
    bookmarks.forEach(bookmark => {
        let bmItem = createBookmarkElement(bookmark);
        bmElem.appendChild(bmItem);
    });
    section.appendChild(bmElem);
}

function createBookmarkElement(bookmark) {
    let elem;
    // Recursion terminates when we reach a 'moz-place' or a 'moz-place-separator'
    if (bookmark.type && bookmark.type === 'text/x-moz-place-separator') {
        elem = document.createElement('hr');
    }
    else if (bookmark.type === 'text/x-moz-place') {
        elem = createMozPlace(bookmark);
    }
    else if (bookmark.type && bookmark.type === 'text/x-moz-place-container') {
        elem = createMozContainer(bookmark);
    }
    else {
        console.log('Unprocessed element in input.');
    }
    return elem;
}

function createMozContainer(bookmark) {
    let card = document.createElement('div');
    card.className += ' card';

    let elem = document.createElement('div');
    elem.className += ' card-body';
    if (bookmark.title) {
        let card_title = document.createElement('div');
        card_title.className += ' card-title';
        card_title.textContent = bookmark.title;
        card.appendChild(card_title);
    }
    if (bookmark.children) {
        let list = document.createElement('ul');
        list.className += bookmark.title;
        list.className += ' list-group';
        bookmark.children.forEach(child => {
            list.appendChild(createBookmarkElement(child));
            elem.appendChild(list);
        });
    }
    card.appendChild(elem);
    return card;
}

function createMozPlace(bookmark) {
    let elem = document.createElement('li');
    elem.className += ' list-group-item';

    /*
    if (bookmark.iconuri) {
        let bookmarkIcon = document.createElement('img');
        bookmarkIcon.className += ' moz-place-ico';
        bookmarkIcon.src = bookmark.iconuri;
        elem.appendChild(bookmarkIcon);
    }
    */

    let spanElem = document.createElement('span');
    spanElem.className += ' h5';
    if (bookmark.title) {
        let bookmarkTitle = document.createTextNode(bookmark.title);
        spanElem.appendChild(bookmarkTitle);
    }
    elem.appendChild(spanElem);

    let openLinkBtn = document.createElement('a');
    openLinkBtn.href = bookmark.uri;
    openLinkBtn.textContent = 'open';
    openLinkBtn.className += ' btn btn-sm btn-outline-primary mx-2';
    openLinkBtn.setAttribute('target', '_blank');
    elem.appendChild(openLinkBtn);

    let copyLinkBtn = document.createElement('button');
    copyLinkBtn.textContent = 'copy';
    copyLinkBtn.className += ' btn btn-sm btn-outline-primary';
    copyLinkBtn.addEventListener('click', function() {
        const adrURI = bookmark.uri;
        copyTextToClipboard(adrURI);
    });
    elem.appendChild(copyLinkBtn);

    return elem;
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

    // Function to copy the URL of a bookmark to clipboard.
    // See https://stackoverflow.com/a/30810322
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
