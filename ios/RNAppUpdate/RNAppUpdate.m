//
//  RNAppUpdate.m
//  RNAppUpdate
//
//  Created by parryworld on 2016/11/18.
//  Copyright © 2016年 parryworld. All rights reserved.
//

#import <React/RCTBridge.h>
#import "RNAppUpdate.h"

@interface RNAppUpdate() {
    NSString *versionName;
    NSString *versionCode;
}
@end

@implementation RNAppUpdate

RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self) {
        versionName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
        versionCode = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"];
    }
    return self;
}

- (NSDictionary *)constantsToExport {
    return @{
             @"versionName":versionName,
             @"versionCode":versionCode,
             };
}

RCT_EXPORT_METHOD(installFromAppStore:(nonnull NSString *)trackViewURL) {
    UIApplication *application = [UIApplication sharedApplication];
    NSURL *URL = [NSURL URLWithString:trackViewURL];
    
    if ([application respondsToSelector:@selector(openURL:options:completionHandler:)]) {
        [application openURL:URL options:@{} completionHandler:nil];
    } else {
        [application openURL:URL];
    }
}

@end
