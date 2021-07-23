'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;

        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);

            if (!data || !data.content) {
                ctx.throw(400, "Please write a content");
            }

            if (!files || !files.thumbnail) {
                ctx.throw(400, "Please upload an image");
            }

            
            const { user } = ctx.state;
            console.log(user)

            entity = await strapi.services.article.create({ ...data, ...{ likes: 0, author: user } }, { files });
        } else {
            ctx.throw(400, "Please use multipart/form-data");
        }
        return sanitizeEntity(entity, { model: strapi.models.article });
    },

    async update(ctx) {
        const { id } = ctx.params;
        const { user } = ctx.state;
        
        let entity;
        if (ctx.is('multipart')) {
            ctx.throw(400, "Please only make JSON request with an updated description");
        } else {
            delete ctx.request.body.likes;
            entity = await strapi.services.article.update({ id, author: user.id }, ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.article });
    },
    
    async delete(ctx) {
        const { id } = ctx.params;
        const { user } = ctx.state;
        const entity = await strapi.services.article.delete({ id, author: user.id });
        return sanitizeEntity(entity, { model: strapi.models.article });
    }

};