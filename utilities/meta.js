const _ = require('lodash');

const sanitize = (text) => {
    text = text || '';

    if (typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/<[^>]+>/g, '')
        .replace(RegExp('&amp', 'g'), '&')
        .replace(new RegExp('&nbsp;', 'g'), ' ');
};

module.exports.bindModelMeta = (options, model, properties) => {
    let title = model.meta_title || model.name || model.title;
    if (title) {
        options.title = sanitize(title);
        options.meta.push({
            hid: 'og:title',
            name: 'og:title',
            content: options.title,
        });
    }

    let description =
        model.meta_description || model.content || model.description;
    if (description) {
        description = sanitize(description).substr(0, 300);

        options.meta.push({
            hid: 'description',
            name: 'description',
            content: description,
        });
        options.meta.push({
            hid: 'og:description',
            name: 'og:description',
            content: description,
        });
    }

    let keywords = model.meta_keywords;
    if (keywords) {
        options.meta.push({
            hid: 'keywords',
            name: 'keywords',
            content: sanitize(keywords).substr(0, 300),
        });
    }

    let images = model.metaImageThumbnail || model.meta_image || [];

    if (properties.image && _.isArray(images)) {
        images = images.concat([properties.image]);
    }

    if (images && images.length > 0) {
        for (var i = 0; i < images.length; i++) {
            options.meta.push({
                hid: 'og:image-' + i,
                name: 'og:image',
                content: images[i],
            });
        }
    }
};
