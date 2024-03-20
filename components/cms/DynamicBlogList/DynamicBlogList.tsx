import React, { useState, useEffect } from 'react';
import { Theme } from '@mui/material';
import clsx from 'clsx';

import { useAppContext } from '@lib/config/AppContext';

import { useCmsContext } from '@lib/cms/CmsContext';
import { Section, LegacySlider, LegacySliderSlide } from '@components/ui';

import DynamicBlogListCard from './DynamicBlogListCard';
import { useAsync } from '@lib/util';
import _ from 'lodash';

const styles = (theme: Theme) => ({
    root: {},
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    item: {
        margin: theme.spacing(),
    },
});

interface Props {
    classes?: any;
    className?: string;
    style?: React.CSSProperties;
    header: string;
    numItems: number;
    tags?: { id: string }[];
    query?: string;
}

const DynamicBlogList = (props: Props) => {
    const { classes, className, header, tags, numItems = 3, query, ...other } = props;

    const [results, setResults] = useState([] as any);

    const { algolia, cms } = useAppContext();
    const { stagingApi, locale } = useCmsContext() || {};
    const indexName = stagingApi ? `${cms.hub}.blog-staging` : `${cms.hub}.blog-production`;

    let searchClient: any;
    if (typeof window !== 'undefined') {
        const { algoliasearch } = window as any;
        searchClient = algoliasearch(algolia.appId, algolia.apiKey);
    }
    useEffect(() => {
        searchClient &&
            searchClient
                .search([
                    {
                        indexName,
                        params: {
                            facetFilters: [
                                ...(tags || []).map((x: any) => `snippet.tags.id:${x.id}`),
                                (locale || 'en-US').indexOf('en-') === 0 ? `locale:en-US` : `locale:${locale}`,
                            ],
                            hitsPerPage: numItems,
                        },
                    },
                ])
                .then((response: any) => setResults(response.results?.[0]?.hits || []));
    }, [searchClient, tags, numItems, locale, indexName]);

    return (
        <div className={clsx(classes?.root, className)} {...other}>
            <Section title={header}>
                <LegacySlider>
                    {results.map((result: any, index: number) => {
                        return (
                            <LegacySliderSlide
                                key={index}
                                index={index}
                                className={clsx({
                                    ['amp-length-2']: results.length < 3,
                                    ['amp-length-3']: results.length >= 3,
                                })}
                            >
                                <DynamicBlogListCard data={result} className={classes?.item} />
                            </LegacySliderSlide>
                        );
                    })}
                </LegacySlider>
            </Section>
        </div>
    );
};

export default DynamicBlogList;
