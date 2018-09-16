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
        populateSection(bookmarks);
    })
    .catch(error => {
        console.log(error);
    });

function populateHeader() {
    let heading = document.createElement('h2');
    heading.textContent = 'Bookmarks';
    header.appendChild(heading);
}

function populateSection(bookmarks) {
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
    let elem = document.createElement('div');
    elem.className += ' card-body';
    let card = document.createElement('div');
    card.className += ' card';
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
    elem.className += ' moz-place';
    elem.className += ' list-group-item';
    if (bookmark.iconuri) {
        let bookmarkIcon = document.createElement('img');
        bookmarkIcon.className += ' moz-place-ico';
        bookmarkIcon.src = bookmark.iconuri;
        elem.appendChild(bookmarkIcon);
    }
    if (bookmark.title) {
        let bookmarkTitle = document.createTextNode(bookmark.title);
        elem.appendChild(bookmarkTitle);
        }
    let bookmarkLink = document.createElement('a');
    bookmarkLink.className += ' btn btn-sm btn-outline-primary mx-2';
    bookmarkLink.setAttribute('target', '_blank');
    let bookmarkLinkText = document.createTextNode('link');
    bookmarkLink.textContent = 'link';
    elem.appendChild(bookmarkLink);
    bookmarkLink.href = bookmark.uri;
    if (bookmark.annos) {
        let annotationElem = document.createElement('div');
        let bookmarkAnnotation = bookmark.annos[0].value;
        annotationElem.textContent = bookmarkAnnotation;
        elem.appendChild(annotationElem);
    }
    return elem;
}
