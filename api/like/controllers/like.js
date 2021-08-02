'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let entity;
        const { user } = ctx.state; // Logged in user
        const { article } = ctx.request.body; // ID of article

        // Article should be a number
        if (typeof article !== 'number') {
            ctx.throw(400, "Please only pass the id for the article");
        }

        // Article should exist
        const realArticle = await strapi.services.article.findOne({
            id: article
        });

        if (!realArticle) {
            ctx.throw(400, "This article doesn't exist");
        }

        // Like shouldn't exist
        const found = await strapi.services.like.findOne({
            user: user.id,
            article
        });


        // console.log(strapi.services.like);

        if (found) {
            console.log(found);
            ctx.throw(400, "You already liked this article");
        }

        if (ctx.is('multipart')) {
            ctx.throw(400, "Only make JSON requests");
            // const { data, files } = parseMultipartData(ctx);
            // entity = await strapi.services.restaurant.create(data, { files });
        } else {
            entity = await strapi.services.like.create({ article, user });
        }

        // Update the likes counter
        const { likes } = realArticle;
        const updatedArticle = await strapi.services.article.update({
            id: article
        }, {
            likes: likes + 1
        });

        return sanitizeEntity(entity, { model: strapi.models.like });
    },

    async delete(ctx) {
        const { user } = ctx.state;
        const { articleId } = ctx.params;

        const article = parseInt(articleId);

        if (typeof article !== 'number') {
            ctx.throw(400, "Please only use the id of the article");
        }

        const entity = await strapi.services.like.delete({
            article,
            user: user.id
        })

        if (entity.length) {
            const { likes } = entity[0].article;
            const updatedArticle = await strapi.services.article.update({
                id: article
            }, {
                likes: likes - 1
            })

            return sanitizeEntity(entity[0], { model: strapi.models.like });

        }
    }
};