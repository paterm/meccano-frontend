import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Reprint from './Reprint/Reprint';
import Button from '../../Shared/Button/Button';
import ListOfArticles from './ListOfArticles/ListOfArticles';
import { ReprintService } from '../../../services/ReprintService';
import { OperatedNotification } from '../../../helpers/Tools';

import './reprints.scss';

const cls = new Bem('reprints');

function Reprints({
    reprints,
    onFieldChange,
    onAddReprint,
    onDeleteReprint,
    onDeleteReprints,
    onCreateArticleFromReprint,
    onCreateSourceInReprints,
    loadedSources,
    loadedCities,
    SourceService,
    LocationService,
    ArticleService,
    currentProject,
    currentArticle,
    userTypeId,
    onSaveReprintsOnly,
    isReadOnly
}) {
    const [isMoveMode, setIsTransferMode] = useState(false);
    const [isReadyToMove, setIsReadyToTransfer] = useState(false);
    const [selectedReprints, setSelectedReprints] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isEmptyTitles, setIsEmptyTitles] = useState(false);

    useEffect(() => {
        setIsEmptyTitles(!!reprints.find(el => el.title === ''));
    });

    useEffect(() => {
        if (isMoveMode) onSaveReprintsOnly();
    }, [isMoveMode]);

    const handleSelectReprint = ({ id, e }) => {
        if (e) {
            setSelectedReprints([...selectedReprints, id]);
        } else {
            const newSelectedReprints = selectedReprints.filter((el) => {
                return el !== id;
            });
            setSelectedReprints(newSelectedReprints);
        }
    };

    const handleСancelTransfer = () => {
        setSelectedReprints([]);
        setIsTransferMode(false);
        setIsReadyToTransfer(false);
    };

    const handleSelectArticle = (articleId) => {
        setSelectedArticle(articleId);
    };

    const moveReprints = () => {
        ReprintService.move({
            params: {
                project: currentProject.id,
                userType: userTypeId
            },
            body: {
                articleFrom: currentArticle.id,
                articleTo: selectedArticle,
                reprints: selectedReprints
            }
        })
            .then(() => {
                OperatedNotification.success({
                    title: 'Перенос перепечаток',
                    message: `Перепечатк${reprints.length > 1 ? 'и' : 'а'} успешно перенесен${reprints.length > 1 ? 'ы' : 'а'}`,
                    submitButtonText: '↗ Открыть целевую статью',
                    timeOut: 10000,
                    onSubmit: () => window.open(`/project/${currentProject.id}/article/${selectedArticle}`, '_blank')
                });
                onDeleteReprints(selectedReprints);
                handleСancelTransfer();
            })
            .catch(error => console.log(error));
    };

    const renderButtons = (
        <>
            <Button
                {...cls('add-button')}
                text="Создать"
                onClick={onAddReprint}
                disabled={isEmptyTitles}
            />
            <Button
                {...cls('transfer-button')}
                text="Перенести"
                onClick={() => setIsTransferMode(true)}
                disabled={!reprints.length || isEmptyTitles}
            />
        </>
    );

    const renderButtonsSelectReprints = (
        <>
            <Button
                {...cls('add-button')}
                text="Отмена"
                onClick={handleСancelTransfer}
                style="error"
            />
            <Button
                {...cls('transfer-button')}
                onClick={() => setIsReadyToTransfer(true)}
                disabled={!selectedReprints.length}
            >
                Перенести выделенные {!!selectedReprints.length &&
                    <span>{selectedReprints.length}</span>
                }
            </Button>
        </>
    );

    const renderButtonsMoveReprints = (
        <>
            <Button
                {...cls('add-button')}
                text="Отмена"
                onClick={handleСancelTransfer}
                style="error"
            />
            <Button
                {...cls('transfer-button')}
                onClick={moveReprints}
                disabled={!selectedArticle}
            >
                Перенести {!!selectedReprints.length &&
                    <span>{selectedReprints.length}</span>
                }
            </Button>
        </>
    );

    const renderListReprints = (
        <div {...cls()}>
            {!isReadOnly && (
                <div {...cls('toolbar')}>
                    {!isMoveMode
                        ? renderButtons
                        : renderButtonsSelectReprints
                    }
                </div>
            )}

            <div {...cls('list')}>
                {reprints.length
                    ? reprints.map((reprint, index) => {
                        return (
                            <Reprint
                                key={index}
                                index={index}
                                onFieldChange={onFieldChange}
                                onDeleteReprint={onDeleteReprint}
                                onSelectReprint={handleSelectReprint}
                                onCreateArticleFromReprint={onCreateArticleFromReprint}
                                onCreateSource={onCreateSourceInReprints}
                                {...reprint}
                                date={new Date(reprint.date)}
                                loadedSources={loadedSources}
                                loadedCities={loadedCities}
                                SourceService={SourceService}
                                LocationService={LocationService}
                                isSelectable={isMoveMode}
                                isReadOnly={isReadOnly}
                            />
                        );
                    })
                    : <p {...cls('no-reprints')}>Нет перепечаток</p>
                }
            </div>
        </div>
    );

    const renderListArticles = (
        <div {...cls()}>
            <div {...cls('toolbar')}>
                {renderButtonsMoveReprints}
            </div>
            <ListOfArticles
                project={currentProject}
                onSelectArticle={handleSelectArticle}
                ArticleService={ArticleService}
                userTypeId={userTypeId}
                currentArticleId={currentArticle.id}
            />
        </div>
    );

    return (
        !isReadyToMove
            ? renderListReprints
            : renderListArticles
    );
}

Reprints.propTypes = {
    reprints: PropTypes.array,
    onFieldChange: PropTypes.func,
    onAddReprint: PropTypes.func,
    onDeleteReprint: PropTypes.func,
    onDeleteReprints: PropTypes.func,
    onSelectReprint: PropTypes.func,
    onCreateArticleFromReprint: PropTypes.func,
    loadedSources: PropTypes.array,
    loadedCities: PropTypes.array,
    SourceService: PropTypes.object,
    LocationService: PropTypes.object,
    ArticleService: PropTypes.object,
    currentProject: PropTypes.object,
    currentArticle: PropTypes.object,
    userTypeId: PropTypes.string,
    currentArticleId: PropTypes.string,
    isReadOnly: PropTypes.bool
};

export default Reprints;
