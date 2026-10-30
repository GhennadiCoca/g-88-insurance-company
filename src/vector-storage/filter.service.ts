import { Injectable } from '@nestjs/common';
import { SearchFilterOr } from './filters/search-filter-or';
import { SearchFilterMatcher } from './filters/search-filter-matcher';
import { SearchFilterParameter } from './filters/search-filter-parameter';
import { SearchFilterAnd } from './filters/search-filter-and';

@Injectable()
export class FilterService {
  createSearchFilter(
    insuranceType: string,
    onlyPublicDocs: boolean,
  ): SearchFilterAnd {
    // Создаём родительский фильтр, который работает по принципу И
    const filter: SearchFilterAnd = new SearchFilterAnd();

    if (onlyPublicDocs) {
      // Создаём "мэтчер" для поиска только общедоступных документов
      const publicMatcher: SearchFilterMatcher = new SearchFilterMatcher();
      publicMatcher.value = true;

      // Создаём поисковый параметр, где указываем по какому параметру
      // должен осуществляться поиск, и какое значение этого параметра
      // мы ищем (значение указано в объекте-мэтчере)
      const publicParameter: SearchFilterParameter =
        new SearchFilterParameter();
      publicParameter.key = 'metadata.publicAccess';
      publicParameter.match = publicMatcher;

      // Добавляем созданный поисковый параметр в родительский фильтр И
      filter.must.push(publicParameter);
    }

    // Для вопросов по обоим видам страхования возвращаем пустой фильтр,
    // чтобы поиск был по всем документам
    if (insuranceType === 'both') {
      return filter;
    }

    // Создаём "мэтчеры" для поиска документов, относящихся ко всем
    // видам страхования и тому виду, по которому пришёл запрос
    const matcher1: SearchFilterMatcher = new SearchFilterMatcher();
    matcher1.value = insuranceType;
    const matcher2: SearchFilterMatcher = new SearchFilterMatcher();
    matcher2.value = 'both';

    // Создаём поисковые параметры, где указываем по какому параметру
    // должен осуществляться поиск, и какое значение этого параметра
    // мы ищем (значение указано в объекте-мэтчере)
    const parameter1: SearchFilterParameter = new SearchFilterParameter();
    parameter1.key = 'metadata.insuranceType';
    parameter1.match = matcher1;
    const parameter2: SearchFilterParameter = new SearchFilterParameter();
    parameter2.key = 'metadata.insuranceType';
    parameter2.match = matcher2;

    // Создаём внутренний фильтр, который работает по принципу ИЛИ
    const filterOr: SearchFilterOr = new SearchFilterOr();

    // В фильтр закладываем поисковые параметры по видам страхования
    filterOr.should = [parameter1, parameter2];

    // Внутренний фильтр ИЛИ кладём внутрь внешнего фильтра И
    filter.must.push(filterOr);

    // Возвращаем внешний родительский фильтр И как результат работы метода
    return filter;
  }

  createScrollFilter(documentId: string): SearchFilterAnd {
    const matcher: SearchFilterMatcher = new SearchFilterMatcher();
    matcher.value = documentId;

    const parameter: SearchFilterParameter = new SearchFilterParameter();
    parameter.key = 'metadata.documentId';
    parameter.match = matcher;

    const filter: SearchFilterAnd = new SearchFilterAnd();
    filter.must = [parameter];

    return filter;
  }
}
